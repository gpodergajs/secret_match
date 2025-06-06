import { IsInt, Min } from 'class-validator';

export class AssignMatchesDto {
  @IsInt()
  @Min(1)
  eventId: number;
}