import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

@Module({
    imports: [
        LoggerModule.forRootAsync({
            useFactory: () => ({
                pinoHttp: {
                    level: process.env.LOG_LEVEL || 'info',
                    transport: {
                        targets: [{
                            target: 'pino-pretty',
                            level: 'info',
                            options: {
                                colorize: true,
                                translateTime: 'SYS:standard',
                                ignore: 'pid,hostname'
                            }
                        }]
                    }
                }
            })
        })
    ]
})
export class PinoLoggerModule { }