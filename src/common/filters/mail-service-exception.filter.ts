import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { MailServiceException } from "../exceptions/mail-service.exception";

@Catch(MailServiceException)
export class MailServiceExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MailServiceExceptionFilter.name);

  catch(exception: MailServiceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.logger.error(`Email service error: ${exception.message}`, {
      failedEmails: exception.failedEmails,
      path: request.url,
    });

    response.status(500).json({
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: 'Email Service Error',
      message: 'Failed to send notification emails. Matches were created successfully.',
      details: {
        failedEmails: exception.failedEmails,
      },
    });
  }
}