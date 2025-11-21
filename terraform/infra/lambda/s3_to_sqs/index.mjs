import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const sqs =  new SQSClient({region : process.env.AWS_REGION})
const s3 = new S3Client({region : process.env.AWS_REGION})

export const handler = async (event) => {
    console.log(`S3 event received`, JSON.stringify(event, null, 2));

    const {SQS_QUEUE_URL, AWS_S3_BUCKET} = process.env
    
    for(const record of event.Records){
        const bucket = record.s3.bucket.name
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "))
        
        // get object meta data
        const head = await s3.send(new HeadObjectCommand({
            Bucket: bucket, Key: key
        }))

        const outputFormat = head.Metadata?.output_format || "mp4"

        const message = {
            inputBucket: bucket,
            inputKey: key,
            outputBucket: AWS_S3_BUCKET,
            outputFormat,
            metadata: head.Metadata,
            timestamp: new Date().toISOString()
        }

        await sqs.send(
            new SendMessageCommand({
                QueueUrl: SQS_QUEUE_URL,
                MessageBody: JSON.stringify(message)
            })
        )

        console.log(`Queued Job for key: ${key}`);
        
    }

    return {statusCode: 200}
}