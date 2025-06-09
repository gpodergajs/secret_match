import { ArgumentsHost, ExceptionFilter, Logger } from "@nestjs/common";

export abstract class BaseExceptionFilter<T extends { message: string; code: string; statusCode: number }> 
  implements ExceptionFilter {
  
  protected readonly logger: Logger;
  protected abstract readonly errorType: string;

  constructor(loggerContext: string) {
    this.logger = new Logger(loggerContext);
  }

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.logger.error(`${this.errorType}: ${exception.message}`, {
      code: exception.code,
      path: request.url,
    });

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: this.errorType,
      code: exception.code,
      message: exception.message,
    });
  }
}