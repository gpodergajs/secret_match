import { Module } from '@nestjs/common';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Match } from './entities/match.entity';
import { EventModule } from 'src/event/event.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Match]), UsersModule, EventModule, MailModule],
  controllers: [MatchController],
  providers: [MatchService]
})
export class MatchModule {}
