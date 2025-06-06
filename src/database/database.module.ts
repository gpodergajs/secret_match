import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEvents } from 'src/event/user-events.entity';
import { Event } from 'src/event/event.entity';
import { Match } from 'src/match/match.entity';
import { Role } from 'src/users/entity/role.entity';
import { User } from 'src/users/entity/user.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type: 'postgres', // TODO: find a way to add support for multiple driver types if possible
                host: config.get('DB_HOST'),
                port: config.get('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_NAME'),
                entities: [User, Role, Match, Event, UsersEvents] // TODO: find a way to list entities dynamically if possible
            }),
            inject: [ConfigService]
        })
    ],
    exports: [TypeOrmModule]
})
export class DatabaseModule {}
