import { Injectable } from "@nestjs/common";
import { Stats } from "fs";
import { StatsD } from "hot-shots";
import winston from "winston";

// for datadog docs
@Injectable()
export class LogService {
    private readonly logger: winston.Logger;
    private readonly metrics: StatsD

    constructor(){

        // setting up winston logger
        this.logger = winston.createLogger({
            level: process.env.DD_LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console()
            ]
        })

        // setting up metrics for datadog
        this.metrics = new StatsD({
            host: process.env.DD_AGENT_HOST || 'localhost',
            port: parseInt(process.env.DD_DOGSTATSD_PORT || '8125'),
            globalTags: {
                service: process.env.DD_SERVICE || 'backend',
                env: process.env.NODE_ENV || 'dev',
            } as any
        })
    }

    // logger methods
    log(message: string, context?: string){
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: string){
        this.logger.error(message, { trace, context });
    }

    warn(message: string, context?: string){
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: string){
        this.logger.debug(message, { context });
    }

    verbose(message: string, context?: string){
        this.logger.verbose(message, { context });
    }

    // metrics methods
    increment(metric: string, tags?: string[]){
        this.metrics.increment(metric, 1, tags);
    }

    gauge(metric: string, value: number, tags?: string[]){
        this.metrics.gauge(metric, value, tags);
    }

    timing(metric: string, value: number, tags?: string[]){
        this.metrics.histogram(metric, value, tags);
    }
}