import { Injectable } from "@nestjs/common";
import { AWSConfig } from "src/config/aws.config";

// get the request from t the controller,
// upload to s3
// from s3 push it to SQS using lambda function
// push to bull queue from sqs for processing
// take the job from bull queue (to be done by video tools service)

@Injectable()
export class VideoToolsBffService {

    constructor(
        private readonly awsConfig: AWSConfig
    )
    {}
    // create pre-signed url for storing in temp-s3 bucket
    async createUploadPreSignedUrl(key: string, contentType:any, metadata: any): Promise<string> {
        // return await this.awsConfig.getUploadUrl(key, contentType, metadata);
        return await this.awsConfig.getUploadUrlV2(key, contentType, metadata);
    }

    async createDownloadPreSignedUrl(key: string): Promise<string> {
        return await this.awsConfig.getDownloadUrl(key);
    }

    async downloadVideo(id: string): Promise<any> {
        // TODO: Implement video download logic
        return { message: 'Not implemented yet', id };
    }
}