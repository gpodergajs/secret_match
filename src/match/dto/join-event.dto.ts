import { IsInt, Min } from "class-validator";

export class JoinEventDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsInt()
  @Min(1)
  eventId: number;
}