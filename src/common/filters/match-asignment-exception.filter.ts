import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { MatchAssignmentException } from "../exceptions/match-assignment.exception";

// filter for match assignment business logic
@Catch(MatchAssignmentException)
export class MatchAssignmentExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MatchAssignmentExceptionFilter.name);

  catch(exception: MatchAssignmentException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.logger.error(`Match assignment error: ${exception.message}`, {
      code: exception.code,
      path: request.url,
    });

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: 'Match Assignment Error',
      code: exception.code,
      message: exception.message,
    });
  }
}