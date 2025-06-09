import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    ConflictException,
    NotFoundException,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { QueryFailedError } from 'typeorm';
  
  @Catch(QueryFailedError)
  export class QueryFailedFilter implements ExceptionFilter {
    private readonly logger = new Logger(QueryFailedFilter.name);

    catch(exception: QueryFailedError & { code?: string }, host: ArgumentsHost) {
      const ctx      = host.switchToHttp();
      const response = ctx.getResponse();
      const request  = ctx.getRequest();
      const sqlCode = exception.code;

     
    // Unique constraint violation
    if (sqlCode === '23505') {
        this.logger.warn('Database conflict error (unique constraint)', {
          code: sqlCode,
          detail: exception.message,
          path: request.url,
        });
  
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          timestamp: new Date().toISOString(),
          path: request.url,
          error: 'Conflict',
          code: 'MATCHES_ALREADY_EXIST',
          message: 'Matches for this round already exist',
        });
      }
  
      // Foreign key constraint violation
      if (sqlCode === '23503') {
        this.logger.warn('Database not-found error (foreign key)', {
          code: sqlCode,
          detail: exception.message,
          path: request.url,
        });
  
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          timestamp: new Date().toISOString(),
          path: request.url,
          error: 'Not Found',
          code: 'FK_CONSTRAINT_VIOLATION',
          message: 'One or more users/events not found',
        });
      }
      // rethrow
      throw exception;
    }
  }