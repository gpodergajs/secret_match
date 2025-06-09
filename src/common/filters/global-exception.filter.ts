import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch() // Catch ALL exceptions
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const httpStatus = exception instanceof HttpException 
      ? exception.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract error message
    let errorMessage = 'Internal server error';
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      errorMessage = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any)?.message || exception.message;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    // Log the error
    this.logger.error(
      `[${request.method} ${request.url}] ${httpStatus} - ${errorMessage}`,
      exception instanceof Error ? exception.stack : String(exception)
    );


    response.status(httpStatus).json({
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: errorMessage

      });
  }
}