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
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const sqlCode = exception.code;
    const { statusCode, message, error, code } = this.handleErrorCode(sqlCode);

    this.logger.warn(`Database error (${sqlCode})`, {
      code: sqlCode,
      detail: exception.message,
      path: request.url,
      statusCode,
    });

    // Return standardized response
    return response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      code,
      message,
    });
  }

  private handleErrorCode(errorCode?: string) {
    switch (errorCode) {
      case '23505': // Unique constraint violation
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Matches for this round already exist',
          error: 'Conflict',
          code: 'MATCHES_ALREADY_EXIST'
        };
      case '23503': // Foreign key constraint violation  
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'One or more users/events not found',
          error: 'Not Found',
          code: 'FK_CONSTRAINT_VIOLATION'
        };
      case '23502': // Not null violation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Required field is missing',
          error: 'Bad Request',
          code: 'NOT_NULL_VIOLATION'
        };
      case '23514': // Check constraint violation
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid data format',
          error: 'Bad Request',
          code: 'CHECK_CONSTRAINT_VIOLATION'
        };
      case '42703': // Undefined column
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database schema error',
          error: 'Internal Server Error',
          code: 'SCHEMA_ERROR'
        };
      case '53300': // Too many connections
        return {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database temporarily unavailable',
          error: 'Service Unavailable',
          code: 'DB_CONNECTION_LIMIT'
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          error: 'Internal Server Error',
          code: 'DB_OPERATION_FAILED'
        };
    }
  }
}