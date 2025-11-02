import { HttpModule } from "@nestjs/axios";
import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { UserController } from "src/controllers/user.controller";

@Module({
    imports: [HttpModule],
    controllers: [UserController]
})
export class UserModule implements OnModuleInit, OnModuleDestroy{
    constructor(
        private readonly logger: Logger
    ){}

    onModuleInit() {
        this.logger.log('UserModule initialized');
    }
    onModuleDestroy() {
        this.logger.log('UserModule destroyed');
    }
}