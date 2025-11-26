import { GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import AWS from 'aws-sdk';

@Injectable()
export class AWSConfig {
    private s3v2: AWS.S3;
    private temp_bucket_name: string
    private permanent_bucket_name: string

    constructor(private configService: ConfigService){
        const region = this.configService.get<string>('AWS_REGION');
        const accessKeyId = this.configService.get<string>('IAM_S3_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('IAM_S3_SECRET_KEY');

        if (!region || !accessKeyId || !secretAccessKey) {
            throw new Error('Missing required AWS configuration: AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_KEY must be set');
        }
        this.s3v2 = new AWS.S3({
            region: this.configService.get<string>('AWS_REGION'),
            accessKeyId: this.configService.get<string>('IAM_S3_ACCESS_KEY'),
            secretAccessKey: this.configService.get<string>('IAM_S3_SECRET_KEY'),
            signatureVersion: 'v4',
        });

        this.temp_bucket_name = this.configService.get<string>('AWS_S3_TEMP_BUCKET') as string
        this.permanent_bucket_name = this.configService.get<string>('AWS_S3_BUCKET') as string
    }

    private sanitizeS3Metadata(metadata: any): Record<string, string> {
        const sanitized: Record<string, string> = {};
        if (!metadata) return sanitized;
        Object.entries(metadata).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            sanitized[key.toLowerCase()] = typeof value === 'string'
                ? value
                : JSON.stringify(value);
        });
        return sanitized;
    }

    async getUploadUrlV2(key: string, contentType: any, metadata: any, expiresIn=3600): Promise<string> {
        const sanitizedMetadata = this.sanitizeS3Metadata(metadata);
        const params: AWS.S3.Types.PutObjectRequest = {
            Bucket: this.temp_bucket_name,
            Key: key,
            ContentType: contentType,
            Metadata: sanitizedMetadata
        };
        return await this.s3v2.getSignedUrlPromise('putObject', { ...params, Expires: expiresIn });
    }

    // download the pre-signed url
    async getDownloadUrl(key: string, expiresIn=3600) {
        const command = new GetObjectCommand({
            Bucket: this.permanent_bucket_name,
            Key: key
        })

        return await getSignedUrl(
            this.s3v2 as any,
            command,
            {expiresIn}
        )
    }
}