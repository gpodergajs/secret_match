// src/common/exceptions/join-event.exception.ts
export class JoinEventException extends Error {
    public readonly code: string;
    public readonly statusCode: number;
  
    constructor(message: string, code: string, statusCode = 400) {
      super(message);
      this.name = 'JoinEventException';
      this.code = code;
      this.statusCode = statusCode;
    }
  }
  