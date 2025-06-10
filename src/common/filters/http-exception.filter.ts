import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/error.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // 获取状态码
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 获取错误信息
    let message: string | string[];
    if (exception instanceof HttpException) {
      message = exception.getResponse()['message'] || exception.message;
    } else {
      message = '服务器内部错误';
    }

    if (Array.isArray(message)) {
      message = message.join(', ');
    }

    // 获取错误详情
    const error = exception instanceof Error ? exception.stack : undefined;

    // 构建错误响应
    const errorResponse: ErrorResponse = {
      code: status,
      message,
      data: null,
      error: process.env.NODE_ENV === 'development' ? error : undefined,
      timestamp: new Date().toISOString(),
    };

    // 记录错误日志
    console.error(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
      {
        status,
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
    );

    // 发送错误响应
    response.status(status).json(errorResponse);
  }
}
