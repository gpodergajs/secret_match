import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Match } from './match.entity';
import { Event } from '../event/event.entity'
import { UsersEvents } from 'src/event/user-events.entity';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), UsersModule, EventModule],
  controllers: [MatchController],
  providers: [MatchService]
})
export class MatchModule {}
