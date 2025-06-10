import { Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "./base-exception.filter";
import { ViewEventException } from "../exceptions/view-event.exception";

@Catch(ViewEventException)
export class ViewEventExceptionFilter extends BaseExceptionFilter<ViewEventException> {
  protected readonly errorType = 'View Event Error';

  constructor() {
    super(ViewEventExceptionFilter.name);
  }
}