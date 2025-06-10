import { Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "./base-exception.filter";
import { JoinEventException } from "../exceptions/join-event.exception";

@Catch(JoinEventException)
export class JoinEventExceptionFilter extends BaseExceptionFilter<JoinEventException> {
  protected readonly errorType = 'Join Event Error';

  constructor() {
    super(JoinEventExceptionFilter.name);
  }
}