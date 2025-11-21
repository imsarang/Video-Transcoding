import { Injectable } from "@nestjs/common";
import { FfmpegConfig } from "src/config/ffmpeg.config";
import { Logger } from "nestjs-pino";
import AWS from 'aws-sdk';
import { PassThrough } from "stream";
import ffmpeg from 'fluent-ffmpeg';
import util from 'util';
import { createWriteStream, unlink } from 'fs';
import { promisify } from 'util';
import { createReadStream } from 'fs';
const unlinkAsync = promisify(unlink);

@Injectable()
export class ConvertService {
    private s3: AWS.S3
    private readonly MAX_S3_RETRIES = 3;
    private readonly RETRY_BACKOFF_MS = 2000;

    constructor(
        private readonly logger: Logger,
        private readonly ffmpegConfig: FfmpegConfig
    ){}

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
        const { inputBucket, inputKey, metadata = {} } = job;
        this.s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            httpOptions: { timeout: 300000 }, // 5 minutes
        });

        // let inputStream: NodeJS.ReadableStream;
        // try {
        //     inputStream = await this.createInputStreamWithRetry(inputBucket, inputKey);
        // } catch (err) {
        //     this.logger.error('[VideoConvert] Failed to fetch input from S3 after retries', { err });
        //     throw err;
        // }

        this.logger.log({
            msg: '[VideoConvert] Starting conversion job',
            inputBucket,
            inputKey,
            metadata,
        });

        // Setup and write S3 stream to temp file with robust event handling
        const tmpPath = `/tmp/${inputKey.replace(/\//g, '_')}`;
        const s3Object = this.s3.getObject({ Bucket: inputBucket, Key: inputKey });
        const inputStream = s3Object.createReadStream();
        const outputFile = createWriteStream(tmpPath);

        let bytesRead = 0;
        inputStream
          .on('open', () => this.logger.log('[VideoConvert] S3 stream open to write data to file'))
          .on('data', (chunk) => {
            bytesRead += chunk.length;
            if (bytesRead % (10 * 1024 * 1024) < chunk.length) {
              this.logger.log('[VideoConvert] S3 read progress', { progress: bytesRead });
            }
          })
          .on('end', () => this.logger.log('[VideoConvert] S3 read end'))
          .on('close', () => this.logger.log('[VideoConvert] S3 read close'))
          .on('error', (err) => {
            this.logger.error('[VideoConvert] S3 stream error during write-to-file', { err });
          });

        await new Promise<void>((resolve, reject) => {
          outputFile
            .on('finish', () => {
              this.logger.log(`[VideoConvert] S3 object written to file: ${tmpPath}`);
              resolve();
            })
            .on('error', (err) => {
              this.logger.error('[VideoConvert] File write error', { err });
              reject(err);
            });
          inputStream.pipe(outputFile);
        });

        // Define output temp file path
        const outputPath = tmpPath.replace(/\.[^/.]+$/, `.${metadata.targetformat}`);

        // this.logger.log(`[VideoConvert] Will convert video`, { realOutputFormat, outputKey: movPath });

        const {
          framerate,
          videoresolution,
          targetformat,
          videoCodec,
          audioCodec,
          noaudio,
          audioBitrate,
          videoBitrate,
          audioChannels,
          audioSampleRate
        } = metadata;
        const realOutputFormat = targetformat || 'mov';
        let width, height;
        if (videoresolution) {
          try {
            if (typeof videoresolution === 'string') {
              ({ width, height } = JSON.parse(videoresolution));
            } else if (typeof videoresolution === 'object') {
              ({ width, height } = videoresolution);
            }
          } catch (err) {
            this.logger.warn('[VideoConvert] Could not parse videoresolution from metadata', { videoresolution, err });
          }
        }
        await new Promise<void>((resolve, reject) => {
          let ffmpegCmd = ffmpeg(tmpPath);
          // Dynamically add all options from metadata when present.
          if (videoCodec) {
            ffmpegCmd = ffmpegCmd.videoCodec(videoCodec);
          } else {
            ffmpegCmd = ffmpegCmd.videoCodec('libx264'); // fallback for mp4/mov
          }
          if (audioCodec && !noaudio) {
            ffmpegCmd = ffmpegCmd.audioCodec(audioCodec);
          }
          if (framerate) {
            ffmpegCmd = ffmpegCmd.fps(Number(framerate));
          }
          if (width && height) {
            ffmpegCmd = ffmpegCmd.size(`${width}x${height}`);
          }
          if (noaudio) {
            ffmpegCmd = ffmpegCmd.noAudio();
          }
          if (videoBitrate) {
            ffmpegCmd = ffmpegCmd.videoBitrate(String(videoBitrate));
          }
          if (audioBitrate && !noaudio) {
            ffmpegCmd = ffmpegCmd.audioBitrate(String(audioBitrate));
          }
          if (audioChannels && !noaudio) {
            ffmpegCmd = ffmpegCmd.audioChannels(Number(audioChannels));
          }
          if (audioSampleRate && !noaudio) {
            ffmpegCmd = ffmpegCmd.audioFrequency(Number(audioSampleRate));
          }
          ffmpegCmd = ffmpegCmd.format(realOutputFormat);

          ffmpegCmd
            .on('start', (commandLine) => {
                this.logger.log('[VideoConvert] FFmpeg command line', { commandLine });
            })
            .on('stderr', (stderrLine) => {
                this.logger.error('[VideoConvert] FFmpeg stderr', { stderrLine });
            })
            .on('codecData', (data) => {
                this.logger.log('[VideoConvert] FFmpeg codecData', { data });
            })
            .on('end', async () => {
                this.logger.log('[VideoConvert] FFmpeg end');
                try {
                    await unlinkAsync(tmpPath);
                    this.logger.log(`[VideoConvert] Deleted temp source file: ${tmpPath}`);
                } catch (e) {
                    this.logger.error('[VideoConvert] Temp file delete failed', { tmpPath, err: e });
                }
                resolve();
            })
            .on('error', (err, stdout, stderr) => {
                this.logger.error('[VideoConvert] FFmpeg error', { err, stdout, stderr });
                reject(err);
            })
            .save(outputPath);
            
        });

        // Now upload new outputPath to S3
        type AWS_S3_Upload_Params = AWS.S3.PutObjectRequest;
        const outputKey = inputKey.replace(/\.[^/.]+$/, `.${metadata.targetformat}`);
        this.logger.log(`[VideoConvert] Uploading converted file to S3: ${outputKey}`);
        await new Promise<void>((resolve, reject) => {
            const outputReadStream = createReadStream(outputPath);
            outputReadStream
              .on('error', (err) => {
                this.logger.error('[VideoConvert] Error reading converted file for S3 upload', { err });
                reject(err);
              });
            this.s3.upload({
              Bucket: process.env.AWS_S3_BUCKET as string,
              Key: outputKey,
              Body: outputReadStream,
              ContentType: `video/${metadata.targetformat}`
            }).promise()
              .then((data) => {
                this.logger.log('[VideoConvert] Upload complete', data);
                resolve();
              })
              .catch((err) => {
                this.logger.error('[VideoConvert] Upload error', { err });
                reject(err);
              });
        });
        // Clean up mov output file
        try {
            await unlinkAsync(outputPath);
            this.logger.log(`[VideoConvert] Deleted temp output file: ${outputPath}`);
        } catch (e) {
            this.logger.error('[VideoConvert] Temp output file delete failed', { outputPath, err: e });
        }

        return {
            success: true,
            message: `Video converted successfully`,
            outputKey: outputKey
        }
    }
}