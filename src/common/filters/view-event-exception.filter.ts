// src/common/filters/view-event.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    Logger,
  } from '@nestjs/common';
  import { ViewEventException } from '../exceptions/view-event.exception';
  
  @Catch(ViewEventException)
  export class ViewEventExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ViewEventExceptionFilter.name);
  
    catch(exception: ViewEventException, host: ArgumentsHost) {
      const ctx      = host.switchToHttp();
      const response = ctx.getResponse();
      const request  = ctx.getRequest();
  
      this.logger.error(`View event error: ${exception.message}`, {
        code: exception.code,
        path: request.url,
      });
  
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: 'View Event Error',
        code: exception.code,
        message: exception.message,
      });
    }
  }
  