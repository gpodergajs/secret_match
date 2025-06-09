import { Catch } from "@nestjs/common";
import { MatchAssignmentException } from "../exceptions/match-assignment.exception";
import { BaseExceptionFilter } from "./base-exception.filter";

@Catch(MatchAssignmentException)
export class MatchAssignmentExceptionFilter extends BaseExceptionFilter<MatchAssignmentException> {
  protected readonly errorType = 'Match Assignment Error';

  constructor() {
    super(MatchAssignmentExceptionFilter.name);
  }
}