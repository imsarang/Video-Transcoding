import { Module } from "@nestjs/common";
import { LogService } from "src/service/logger.service";

@Module({
    providers: [LogService],
    exports: [LogService]
})
export class DataDogLogger {}