// src/common/filters/join-event.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    Logger,
  } from '@nestjs/common';
import { JoinEventException } from '../exceptions/join-event.exception';
  
  
  @Catch(JoinEventException)
  export class JoinEventExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(JoinEventExceptionFilter.name);
  
    catch(exception: JoinEventException, host: ArgumentsHost) {
      const ctx      = host.switchToHttp();
      const response = ctx.getResponse();
      const request  = ctx.getRequest();
  
      // Log with structured metadata
      this.logger.error(`Join event error: ${exception.message}`, {
        code: exception.code,
        path: request.url,
      });
  
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: 'Join Event Error',
        code: exception.code,
        message: exception.message,
      });
    }
  }
  