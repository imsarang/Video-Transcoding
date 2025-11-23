import { Controller, Post, Body, Headers } from "@nestjs/common";
import { ConvertService } from "./video-convert.service";

// Type: 'SubscriptionConfirmation',
//   MessageId: '61ab9260-1161-4302-aa24-3546d5849345',
//   Token: '2336412f37fb687f5d51e6e2425a8a597005420f790d59fd8286493ec20d88e4f7927be908357d9e296a8256943949f50392afe050ebf50eef5f532d3622f0803d6d95acc8a77680a2a6c80efafffd971f81beb43a07edef9ca062fd5516ef8f3e8e2a94e28269db1577f73d0d5d20a869256110a8fe85ef9dd54e355d16e258',
//   TopicArn: 'arn:aws:sns:ap-south-1:632550282182:video-event-topic',
//   Message: 'You have chosen to subscribe to the topic arn:aws:sns:ap-south-1:632550282182:video-event-topic.\n' +
//     'To confirm the subscription, visit the SubscribeURL included in this message.',
//   SubscribeURL: 'https://sns.ap-south-1.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:ap-south-1:632550282182:video-event-topic&Token=2336412f37fb687f5d51e6e2425a8a597005420f790d59fd8286493ec20d88e4f7927be908357d9e296a8256943949f50392afe050ebf50eef5f532d3622f0803d6d95acc8a77680a2a6c80efafffd971f81beb43a07edef9ca062fd5516ef8f3e8e2a94e28269db1577f73d0d5d20a869256110a8fe85ef9dd54e355d16e258',
//   Timestamp: '2025-11-22T21:02:34.995Z',
//   SignatureVersion: '1',
//   Signature: 'JWP7XGxEuHMqv6H0aF/IvSpi/LCW9iOP1kwZCvwL4zQ3mhA9+GX/QqMOYj/+DeOnkm3dXwY12uB5mBrT1xrYMgTGZ7kUoGXUeBa0QtVKtjZAjqZzN2lzqGBzxuAxAI3sm0DtorgYVpqkrpLnvxUjzEK397RqJNlNKgJi/+lThwA98sOkFMMBfSWZ9sKdKXlbuUm1UwDlJVt6I28YpsxRm0fAGMQoKt7O2QE6Tzorw65PnwfUMYAvsxmjAxuGW4upKth5SzYRZY9xISVw++ac9cGMYIUG7bQz6K4uJtsIFOGbbRDMSUciKeS5/VbRgja/70piael4uOZCKo9DXJfBlg==',
//   SigningCertURL: 'https://sns.ap-south-1.amazonaws.com/SimpleNotificationService-6209c161c6221fdf56ec1eb5c821d112.pem'

@Controller('/processing/convert')
export class ConvertController {
    constructor(private readonly convertService: ConvertService) {}

    @Post('/')
    async convertVideo(@Body() body: any) {
        try{
            const result = await this.convertService.convertVideoFormat(body);
            return {
              success: true,
              outputKey: result.outputKey,
              message: result.message
            }
        }
        catch(e){
            console.error('Error converting video:', e);
            return { success: false, error: e };
        }
    }
}