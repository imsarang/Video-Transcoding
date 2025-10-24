import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import cors from "cors";

@Module({})
export class CorsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(
            cors({
                origin: '*',
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
                preflightContinue: false,
                optionsSuccessStatus: 204,
            })
        )
        .forRoutes('*');
    }
}