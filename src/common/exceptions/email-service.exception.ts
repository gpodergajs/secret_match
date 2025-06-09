export class EmailServiceException extends Error {
  constructor(
    message: string,
    public readonly failedEmails: string[] = []
  ) {
    super(message);
    this.name = 'EmailServiceException';
  }
}