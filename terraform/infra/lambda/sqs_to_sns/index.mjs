import {SNSClient, PublishCommand} from "@aws-sdk/client-sns";

const sns = new SNSClient({
    region : process.env.AWS_REGION
});
    
export const handler = async (event) => {
    console.log('SNS_TOPIC_ARN : ', process.env.SNS_TOPIC_ARN);
    console.log(`SNS event received`, JSON.stringify(event, null, 2));

    for (const record of event.Records){
        const response = await sns.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: record.body,
            Subject: 'Video Processing Event'
        }))
        console.log(`Published message to topic: ${JSON.stringify(response, null, 2)}`);
    }
}