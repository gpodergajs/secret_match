import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEvents } from './user-events.entity';
import { Event } from './event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, UsersEvents])],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule {}
