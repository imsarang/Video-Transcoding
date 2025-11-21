import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";

export class ResponseInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        let ctx = context.switchToHttp()
        let response = ctx.getResponse()
        const statusCode = response.statusCode || 200;
        
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data: data,
                statusCode: statusCode,
                message: `Request processed successfully`,
                timestamp: new Date().toISOString()
            }))
        )
    }
}