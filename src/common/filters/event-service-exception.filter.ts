import { Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "./base-exception.filter";
import { EventServiceException } from "../exceptions/event-service.exception";

@Catch(EventServiceException)
export class EventServiceExceptionFilter extends BaseExceptionFilter<EventServiceException> {
  protected readonly errorType = 'Event Service Error';

  constructor() {
    super(EventServiceException.name);
  }
}