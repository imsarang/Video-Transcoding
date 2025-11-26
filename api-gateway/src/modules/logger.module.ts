import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

@Module({
    imports: [
        LoggerModule.forRootAsync({
            useFactory: () => {
                const base: any = {
                    pinoHttp: {
                        level: process.env.LOG_LEVEL || 'info',
                        autoLogging: false,
                        serializers: {
                            req: () => undefined, // Remove req object from logs
                            request: () => undefined // Also remove request alias
                        }
                    }
                };

                // pino-pretty is a dev-time pretty printer and is listed as a devDependency.
                // In production (Docker) devDependencies may not be installed which causes
                // pino to fail resolving the transport target. Use the pretty transport only
                // when not running in production.
                if (process.env.NODE_ENV !== 'production') {
                    base.pinoHttp.transport = {
                        targets: [{
                            target: 'pino-pretty',
                            level: 'info',
                            options: {
                                colorize: true,
                                translateTime: 'SYS:standard',
                                ignore: 'pid,hostname'
                            }
                        }]
                    };
                }

                return base;
            }
        })
    ]
})
export class PinoLoggerModule { }