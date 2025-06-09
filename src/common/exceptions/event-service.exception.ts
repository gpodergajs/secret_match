export class EventServiceException extends Error {
    public readonly code: string;
    public readonly statusCode: number;
  
    constructor(message: string, code: string, statusCode = 500) {
      super(message);
      this.name = 'EventServiceException';
      this.code = code;
      this.statusCode = statusCode;
    }
  }
  