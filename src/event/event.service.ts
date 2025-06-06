import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersEvents } from './user-events.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './event.entity'
import { User } from '../users/entity/user.entity'

@Injectable()
export class EventService {
    constructor(@InjectRepository(UsersEvents) private readonly userEventsRepository: Repository<UsersEvents>) { }

    // find a user for an event
    async findUserEvent(userId: number, eventId: number) {
        try {
            const userEvent = await this.userEventsRepository.findOne({
                where: { user_id: userId, event_id: eventId }
            });

            return userEvent;
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to find user event: ${error.message}`
            );
        }
    }

    async findAllEventUsers(eventId: number) {
        try {
            const eventUsers = await this.userEventsRepository.find({
                where: { event_id: eventId },
                relations: ['user'] // Include user details if needed
            });

            return eventUsers;
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to find event users: ${error.message}`
            );
        }
    }

    // create a user in an event
    async createUserEvent(userId: number, eventId: number) {
        try {
            // Check if relationship already exists
            const existingUserEvent = await this.findUserEvent(userId, eventId);
            if (existingUserEvent) {
                throw new ConflictException(
                    `User ${userId} is already registered for event ${eventId}`
                );
            }

            const userEvent = this.userEventsRepository.create({
                user_id: userId,
                event_id: eventId
            });

            return await this.userEventsRepository.save(userEvent);
        } catch (error) {
            // Re-throw known exceptions
            if (error instanceof ConflictException) {
                throw error;
            }

            // Handle database constraint violations
            if (error.code === '23505') { // PostgreSQL unique constraint
                throw new ConflictException(
                    `User ${userId} is already registered for event ${eventId}`
                );
            }

            if (error.code === '23503') { // PostgreSQL foreign key constraint
                throw new NotFoundException(
                    `User ${userId} or Event ${eventId} not found`
                );
            }

            // Generic error for unexpected issues
            throw new InternalServerErrorException(
                `Failed to create user event: ${error.message}`
            );
        }
    }
}
