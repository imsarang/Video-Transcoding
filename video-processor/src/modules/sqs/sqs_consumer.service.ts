import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Logger, PinoLogger } from "nestjs-pino";
import { ConvertService } from "../video-convert/video-convert.service";

@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {

    private readonly sqs: SQSClient
    private isRunning = false

    constructor (
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly videoConvertService: ConvertService

    ){
        this.sqs = new SQSClient({region: this.configService.get<string>('AWS_REGION') || 'ap-south-1'})
    }
    
    async onModuleInit() {
        this.isRunning = true
        this.logger.info(`Starting SQS Consumer`)
        this.pollQueue()    
    }

    async onModuleDestroy() {
        this.isRunning = false
    }

    private async pollQueue(){
        const queueUrl =  this.configService.get<string>('AWS_VIDEO_SQS_URL')

        console.log(queueUrl);
        
        const pollInterval=5000

        while(this.isRunning)
        {
            const command = new ReceiveMessageCommand({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 1,
                WaitTimeSeconds: 10,
                VisibilityTimeout: 60
            })

            const {Messages} = await this.sqs.send(command)

            if(Messages && Messages.length > 0)
            {
                for(const msg of Messages)
                {
                    const body = JSON.parse(msg.Body as string)
                    this.logger.info(`Received Job`)
                    await this.processJob(body)

                    // delete message after success
                    await this.sqs.send(
                        new DeleteMessageCommand({
                        QueueUrl: queueUrl,
                        ReceiptHandle: msg.ReceiptHandle!,
                        }),
                    );
                }
            }
        }
    }

    private async processJob (job: any){
        const { metadata } = job;
        if(metadata.job === "convert")
        {
            return await this.videoConvertService.convertVideoFormat(job)
        }
        else {
            this.logger.error(`Invalid job type: ${metadata.job}`)
            return {
                success: false,
                message: `Invalid job type: ${metadata.job}`
            }
        }
        // else if(metadata.job === "transcode")
        // {
        //     return await this.videoTranscodeService.transcodeVideo(job)
        // }
        // else if(metadata.job === "thumbnail")
        // {
        //     return await this.videoThumbnailService.generateThumbnail(job)
        // }
    }
}