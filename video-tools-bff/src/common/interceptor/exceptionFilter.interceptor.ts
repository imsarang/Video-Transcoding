import { ArgumentsHost, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

export class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception.getStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception.message ?? 'Internal server error';

        response.status(status).json({
            success: false,
            message: message,
            errorCode: message.errorCode || null,
            timestamp: new Date().toISOString(),
            path: request.url
        })
    }
}