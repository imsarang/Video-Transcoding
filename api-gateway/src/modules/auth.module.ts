import { HttpModule } from "@nestjs/axios";
import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { Logger } from "nestjs-pino";
import { AuthController } from "src/controllers/auth.controller";

@Module({
    imports: [
        HttpModule,
        JwtModule.register({})
    ],
    controllers: [AuthController]
})
export class AuthModule implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly logger: Logger) {}
    onModuleInit() {
        this.logger.log('AuthModule initialized');
    }

    onModuleDestroy() {
        this.logger.log('AuthModule destroyed');
    }
}
