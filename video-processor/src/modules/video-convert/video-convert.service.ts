import { Injectable } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import AWS from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, unlinkSync, createReadStream } from 'fs';
import { ConfigService } from "@nestjs/config";
import { RedisService } from "src/modules/redis/redis.service";

interface VideoProgress {
  status: string;
  percent: number;
  message: string;
  error?: string;
  outputKey?: string;
  job: string;
}

@Injectable()
export class ConvertService {
    private s3: AWS.S3;
    private readonly MAX_S3_RETRIES = 3;
    private readonly RETRY_BACKOFF_MS = 2000;
    constructor(
        private readonly logger: Logger,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService
    ){
        this.logger.log('ConvertService initialized');
    }

    async createInputStreamWithRetry(inputBucket: string, inputKey: string, attempt = 1): Promise<NodeJS.ReadableStream> {
        this.logger.log(`[VideoConvert] Fetching S3 input stream (attempt ${attempt})`);

        // Fetch object metadata for Content-Length
        let contentLength = 0;
        try {
            const head = await this.s3.headObject({ Bucket: inputBucket, Key: inputKey }).promise();
            contentLength = head.ContentLength || 0;
            this.logger.log(`[VideoConvert] S3 object size: ${contentLength} bytes`);
        } catch(e) {
            this.logger.error('[VideoConvert] headObject failed', e);
            // It's typically unsafe to proceed
            throw e;
        }

        const inputStream = this.s3.getObject({
            Bucket: inputBucket,
            Key: inputKey
        }).createReadStream();

        let byteStreamRead = 0;
        return new Promise<NodeJS.ReadableStream>((resolve, reject) => {
            let bytesRead = 0;
            let errored = false;

            inputStream
            .on('open', () => {
                this.logger.log('[VideoConvert] S3 read open');
            })
            .on('data', (chunk) => {
                byteStreamRead += chunk.length;
                if(byteStreamRead % (10 *1024) < chunk.length){
                    this.logger.log('[VideoConvert] S3 read progress', { progress: byteStreamRead});
                }
            })
            .on('end', () => {
                this.logger.log('[VideoConvert] S3 read end');
            })
            .on('error', (err) => {
                errored = true;
                this.logger.error('[VideoConvert] S3 read error', { err });
                if(attempt <= this.MAX_S3_RETRIES)
                {
                    setTimeout(async() => {
                        try {
                            const retryStream = await this.createInputStreamWithRetry(inputBucket, inputKey, attempt + 1);
                            resolve(retryStream);
                        } catch (e) {
                            this.logger.error('[VideoConvert] Failed to fetch input from S3 after retries', { err: e });
                            reject(e);
                        }
                    }, this.RETRY_BACKOFF_MS);
                } else {
                    reject(new Error('Failed to fetch input from S3 after retries'));
                }
            })
            .on('close', () => {
                this.logger.log('[VideoConvert] S3 read close');
            })
        })
    }

    async convertVideoFormat(job: any) {
        const { inputBucket, inputKey, outputFormat, metadata = {} } = job;
        this.logger.log({job})
        const progressChannel = `video-progress:${inputKey}`;
        // this.logger.log(`[VideoConvert] Progress channel: ${progressChannel} ${targetformat}`);
        const publishProgress = async (progress: VideoProgress) => {
            await this.redisService.publish(progressChannel, JSON.stringify(progress));
        };

        let progressData: VideoProgress = { status: 'started', percent: 0, message: 'Job started', job: 'video-convert' };
        this.logger.log(`[VideoConvert] Progress data: ${JSON.stringify(progressData)}`);
        await publishProgress(progressData);

        this.s3 = new AWS.S3({ region: process.env.AWS_REGION });

        // Use sanitized inputKey as tmp file base
        const ext = (inputKey.split('.').pop() || 'mp4');
        const targetExt = outputFormat || metadata.outputFormat || 'mp4';
        const baseFile = inputKey.replace(/\//g, '_');
        const inputTmpPath = `/tmp/${baseFile}`;
        const outputTmpPath = `/tmp/${baseFile}-output.${targetExt}`;

        // Download from S3 to local tmp file
        try {
            const s3Object = this.s3.getObject({ Bucket: inputBucket, Key: inputKey });
            const inputStream = s3Object.createReadStream();
            const outputFile = createWriteStream(inputTmpPath);
            await new Promise<void>((resolve, reject) => {
                inputStream.pipe(outputFile)
                    .on('finish', resolve)
                    .on('error', reject);
            });
            progressData = { ... progressData, status: 'downloaded', percent: 10, message: 'Downloaded input from S3' };
            await publishProgress(progressData);
        } catch (err) {
            progressData = { ...progressData, status: 'error', percent: 0, message: 'Failed to download from S3', error: err.message };
            await publishProgress(progressData);
            throw err;
        }

        this.logger.log(progressData)
        // FFmpeg processing block
        let ffmpegPercent = 10;
        let ffmpegComplete = false;
        // --- Construct ffmpeg command with robust metadata checks/defaults ---
        let ffmpegCmd = ffmpeg(inputTmpPath);

        // Video Codec
        if (metadata.videoCodec) {
          ffmpegCmd = ffmpegCmd.videoCodec(metadata.videoCodec);
        } else {
          ffmpegCmd = ffmpegCmd.videoCodec('libx264'); // default
        }

        // Audio Codec
        if ((metadata.audioCodec !== undefined && !(metadata.noaudio === 'true' || metadata.noaudio === true))) {
          ffmpegCmd = ffmpegCmd.audioCodec(metadata.audioCodec);
        } // else: use ffmpeg defaults or inherit from source

        // Frame Rate
        const framerate = metadata.framerate !== undefined ? Number(metadata.framerate) : 30;
        if (!isNaN(framerate) && framerate > 0) {
          ffmpegCmd = ffmpegCmd.fps(framerate);
        }

        // Video Resolution
        let width = undefined, height = undefined;
        if (metadata.videoresolution) {
          try {
            let vresObj = metadata.videoresolution;
            if (typeof vresObj === 'string') {
              vresObj = JSON.parse(vresObj);
            }
            width = vresObj.width;
            height = vresObj.height;
          } catch {}
        }
        if (width && height && Number(width) > 0 && Number(height) > 0) {
          ffmpegCmd = ffmpegCmd.size(`${width}x${height}`);
        } // else fallback to source resolution

        // No audio (mute)
        if (metadata.noaudio === 'true' || metadata.noaudio === true) {
          ffmpegCmd = ffmpegCmd.noAudio();
        }

        // Video Bitrate
        if (metadata.videoBitrate) {
          ffmpegCmd = ffmpegCmd.videoBitrate(String(metadata.videoBitrate));
        }
        // Audio Bitrate
        if (metadata.audioBitrate && !(metadata.noaudio === 'true' || metadata.noaudio === true)) {
          ffmpegCmd = ffmpegCmd.audioBitrate(String(metadata.audioBitrate));
        }
        // Audio Channels
        const audioChannels = metadata.audioChannels !== undefined ? Number(metadata.audioChannels) : null;
        if (audioChannels && !isNaN(audioChannels) && !(metadata.noaudio === 'true' || metadata.noaudio === true)) {
          ffmpegCmd = ffmpegCmd.audioChannels(audioChannels);
        }
        // Audio Sample Rate
        const audioSampleRate = metadata.audioSampleRate !== undefined ? Number(metadata.audioSampleRate) : null;
        if (audioSampleRate && !isNaN(audioSampleRate) && !(metadata.noaudio === 'true' || metadata.noaudio === true)) {
          ffmpegCmd = ffmpegCmd.audioFrequency(audioSampleRate);
        }

        // Output format (container)
        ffmpegCmd = ffmpegCmd.format(targetExt);
        
        // --- End ffmpeg build ---

        try {
            await new Promise<void>((resolve, reject) => {
                ffmpegCmd
                    .on('start', async () => {
                        ffmpegPercent = 15;
                        await publishProgress({...progressData, status: 'processing', percent: ffmpegPercent, message: 'Started Video Conversion'});
                    })
                    .on('progress', async (progress) => {
                        if (progress.percent) {
                            ffmpegPercent = Math.floor(10 + progress.percent * 0.7); // scale to ~80%
                            await publishProgress({...progressData, status: 'processing', percent: ffmpegPercent, message: `Processing (${progress.percent.toFixed(2)}%)`});
                        }
                    })
                    .on('end', async () => {
                        ffmpegPercent = 90;
                        ffmpegComplete = true;
                        await publishProgress({...progressData, status: 'processed', percent: ffmpegPercent, message: 'Conversion finished'});
                        resolve();
                    })
                    .on('error', async (err, stdout, stderr) => {
                        this.logger.error(`[VideoConvert] FFmpeg error: ${err.message}`, { stdout, stderr });
                        await publishProgress({...progressData, status: 'error', percent: ffmpegPercent, message: 'Video Conversion error', error: err.message});
                        reject(err);
                    })
                    .save(outputTmpPath);
            });
        } catch (err) {
            progressData = { ...progressData, status: 'error', percent: ffmpegPercent, message: 'Error during video processing', error: err.message };
            await publishProgress(progressData);
            throw err;
        }

        // Upload result
        try {
            // Always ensure outputKey has the right extension by removing any existing one and adding -converted.<targetExt>
            const outputKey = inputKey.replace(/\.[^/.]+$/, '') + `-converted.${targetExt}`;
            this.logger.log(`[VideoConvert] Uploading to S3: ${outputKey}`);
            await this.s3.upload({
                Bucket: this.configService.get<string>('AWS_S3_BUCKET') as string,
                Key: outputKey,
                Body: createReadStream(outputTmpPath),
                ContentType: `video/${targetExt}`,
                Metadata: metadata
            }).promise()
            .then(() => {
                this.logger.log(`[VideoConvert] Upload complete: ${outputKey}`);
                progressData = { ...progressData, status: 'uploaded', percent: 99, message: 'Upload complete', outputKey };

            })
            .catch((err) => {
                this.logger.error(`[VideoConvert] Upload error: ${outputKey}`, err);
                progressData = { ...progressData, status: 'error', percent: 99, message: 'Upload error', error: err.message };
                throw err;
            });
            await publishProgress(progressData)
            .then(()=>this.logger.log(`[VideoConvert] Upload complete: ${outputKey}`))
            .catch((err) => this.logger.error(`[VideoConvert] Upload error: ${outputKey}`, err));

            // Cleanup
            try {
                unlinkSync(inputTmpPath);
                unlinkSync(outputTmpPath);
            } catch(e) {
                this.logger.warn("Temp file delete failed", e);
            }
            progressData = { ...progressData, status: 'completed', percent: 100, message: 'Job completed successfully', outputKey };
            await publishProgress(progressData);

            return { success: true, outputKey, message: 'Video converted successfully' };
        } catch(err) {
            progressData = { ...progressData, status: 'error', percent: ffmpegComplete ? 90 : ffmpegPercent, message: 'Upload error', error: err.message };
            await publishProgress(progressData);
            throw err;
        }
    }
}