import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = 'Internal server error';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const res = exception.getResponse();
            message = typeof res === 'object' ? res : { message: res };
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        this.logger.error(
            `HTTP ${statusCode} - ${request.method} ${request.url} - ${JSON.stringify(message)}`,
        );

        response.status(statusCode).json({
            success: false,
            statusCode,
            error: message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
