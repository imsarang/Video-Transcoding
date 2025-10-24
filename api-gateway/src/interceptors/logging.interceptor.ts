import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        private readonly logger: Logger
    ){}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;
        const url = req.url;

        const now = Date.now();

        return next.handle().pipe(
            // tap operator to log after response is sent
            tap(() => {
                const responseTime = Date.now() - now;
                this.logger.log(`[API GATEWAY] Method: [${method}] ${url} - Duration: ${responseTime}ms`);
            })
        );
    }
}