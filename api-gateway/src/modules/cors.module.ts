import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import cors from "cors";

@Module({})
export class CorsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(
            cors({
                origin: true,  // Reflect request origin instead of '*'
                credentials: true,  // Required for cookies/auth
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                allowedHeaders: 'content-type,authorization',
                preflightContinue: false,
                optionsSuccessStatus: 204,
            })
        )
        .forRoutes('*');
    }
}