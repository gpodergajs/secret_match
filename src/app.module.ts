import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MatchModule } from './match/match.module';
import { EventModule } from './event/event.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, DatabaseModule, AuthModule, MatchModule, EventModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
