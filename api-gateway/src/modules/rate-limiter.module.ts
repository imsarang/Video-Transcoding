import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
    imports: [
        // create object according to environment at run time
        ThrottlerModule.forRoot([{
            ttl: parseInt(process.env.RATE_LIMIT_TTL as string) || 60,
            limit: parseInt(process.env.RATE_LIMIT_COUNT as string) || 100
        }])
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard  // this automatically applies rate limiting globally, without mentioning it in each controller
        }
    ]
})
export class RateLimiterModule { }