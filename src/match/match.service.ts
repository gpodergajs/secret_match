import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entity/match.entity';
import { EventService } from 'src/event/event.service';
import { MailService } from 'src/mail/mail.service';
import { ViewEventResponseDto } from './dto/view-event-response.dto';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { MatchAssignmentException } from 'src/common/exceptions/match-assignment.exception';
import { EmailServiceException } from 'src/common/exceptions/email-service.exception';
import { JoinEventException } from 'src/common/exceptions/join-event.exception';
import { ViewEventException } from 'src/common/exceptions/view-event.exception';
import { UsersEvents } from 'src/event/user-events.entity';

@Injectable()
export class MatchService {
    private readonly logger = new Logger(MatchService.name)

    constructor(
        @InjectRepository(Match)
        private readonly matchRepo: Repository<Match>,
        private readonly eventService: EventService,
        private readonly mailService: MailService,
    ) { }

    // TODO: try catch and exception handling nad logging
    async joinEvent(userId: number, roleId: number, eventId: number) {
        if (!userId || !eventId) {
            throw new JoinEventException(
                'User ID and Event ID are required',
                'MISSING_EVENT_OR_USER',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (roleId === UserRoles.ADMIN) {
            throw new JoinEventException(
                'Admins cannot join the event. That would be cheating',
                'ADMIN_CANNOT_JOIN',
                HttpStatus.BAD_REQUEST,
            );
        }

        const existing = await this.eventService.findUserEvent(userId, eventId);
        if (existing) {
            throw new JoinEventException(
                `User ${userId} is already registered for event ${eventId}`,
                'ALREADY_REGISTERED',
                HttpStatus.CONFLICT,
            );
        }


        const newUserEvent = await this.eventService.createUserEvent(userId, eventId);
        this.logger.log(`User ${userId} successfully joined event ${eventId} with role ${roleId}`);
        return newUserEvent;
    }



    async view(userId: number, eventId: number): Promise<ViewEventResponseDto> {
        
        // Validate infput
        if (!userId || !eventId) {
            throw new ViewEventException(
                'User ID and Event ID are required',
                'MISSING_EVENT_OR_USER',
                400,
            );
        }

        // Check if any match is found for user
        const match = await this.matchRepo.findOne({
            order: { round_number: 'DESC' },
            where: [
                { user1_id: userId, event_id: eventId },
                { user2_id: userId, event_id: eventId },
            ],
            relations: ['user1', 'user2'],
        });

        if (!match) {
            throw new ViewEventException(
                `No match found for user ${userId} in event ${eventId}`,
                'MATCH_NOT_FOUND',
                404,
            );
        }

        // Create response and return
        const dto = new ViewEventResponseDto();
        dto.matchName =
            match.user1_id === userId ? match.user2.name : match.user1.name;

        this.logger.log(`User ${userId} viewed match in event ${eventId}`);
        return dto;
    }

    async assign(eventId: number): Promise<any> {

        // Validate input
        if (!eventId || eventId <= 0) {
            throw new MatchAssignmentException(
                'Valid Event ID is required',
                'INVALID_EVENT_ID',
                HttpStatus.BAD_REQUEST
            );
        }

        // Get all event users
        const userEvents = await this.eventService.findAllEventUsers(eventId);
        if (!userEvents || userEvents.length === 0) {
            throw new MatchAssignmentException(
                `No users registered for event ${eventId}`,
                'NO_USERS_FOUND', HttpStatus.NOT_FOUND);

        }

        const user_ids = userEvents.map(user => user.user_id);
        // Check if we have enough users for pairing
        if (user_ids.length < 2) {
            throw new MatchAssignmentException(
                `Insufficient users for matching. Found ${user_ids.length} users, minimum required: 2`,
                'INSUFFICIENT_USERS',
                HttpStatus.BAD_REQUEST
            );
        }

        // Get current round number and raise
        const currentRound = await this.getCurrentRoundNumber(eventId);
        const nextRound = currentRound + 1;

        // Shuffle before pairing for randomization
        const shuffled_user_ids: number[] = await this.shuffleArray([...user_ids]); // Create copy to avoid mutation
        const pairs: [number, number][] = await this.getNonOverlappingPairs(shuffled_user_ids);

        if (pairs.length === 0) {
            throw new MatchAssignmentException(
                'Unable to create valid user pairs for matching',
                'PAIRING_FAILED',
                HttpStatus.BAD_REQUEST
            );
        }

        // Create the match entities
        const matches: Match[] = pairs.map(([user1Id, user2Id]) => {
            return this.matchRepo.create({
                user1: { id: user1Id },
                user2: { id: user2Id },
                event_id: eventId,
                round_number: nextRound
            });
        });

        // Save all matches in a transaction
        const savedMatches = await this.matchRepo.save(matches);
        this.logger.log(`Assigned ${savedMatches.length} matches for event ${eventId}, round ${nextRound}`);

        // Send all matched users mail ( send in parallel )
        this.sendMatchNotifications(savedMatches, userEvents).catch(error => {
            this.logger.error('Failed to send match notification emails', {
                error: error.message,
                eventId,
                round: nextRound,
            });
        });

        // TODO: create proper output
        return savedMatches;
    }

    // private methode that handles sending match emails ( handlers failed dispatches accordingly )
    private async sendMatchNotifications(
        savedMatches: Match[],
        userEvents: UsersEvents[]
    ): Promise<void> {
        const emailPromises: Promise<any>[] = [];
        const failedEmails: string[] = [];

        for (const savedMatch of savedMatches) {
            const pair = userEvents.filter(u =>
                [savedMatch.user1_id, savedMatch.user2_id].includes(u.user_id),
            );

            const pairEmailPromises = pair.map(async userEvent => {
                try {
                    const matchedUser = pair.find(u => u.user_id !== userEvent.user_id)!;
                    const sentMatchMail =  await this.mailService.sendMatchMail(
                        userEvent.user.email,
                        userEvent.user.name,
                        matchedUser.user.name,
                        userEvent.event.location,
                    );
                    
                    this.logger.log(`Successfully sent match notification emails for user ${userEvent.user.id} and user ${matchedUser.user_id} matches`);
                    return sentMatchMail
                } catch (error) {
                    failedEmails.push(userEvent.user.email);
                    this.logger.warn(`Failed to send email to ${userEvent.user.email}`, error);
                    throw error;
                }
            });

            emailPromises.push(...pairEmailPromises);
        }

        // promise.all() will reject immediately upon any of the input promises rejecting. 
        // In comparison, the promise returned by Promise.allSettled() will wait for all input promises to complete
        try {
            await Promise.allSettled(emailPromises);
        } catch (error) {
            throw new EmailServiceException(
                'Some notification emails failed to send',
                failedEmails
            );
        }

        if (failedEmails.length > 0) {
            throw new EmailServiceException(
                `Failed to send emails to ${failedEmails.length} recipients`,
                failedEmails
            );
        }

        this.logger.log(`Successfully sent match notification emails for ${emailPromises.length - failedEmails.length} matches`);
    }


    private async getCurrentRoundNumber(eventId: number): Promise<number> {
        try {
            const latestMatch = await this.matchRepo.findOne({
                where: { event_id: eventId },
                order: { round_number: 'DESC' }
            });

            return latestMatch?.round_number || 0;
        } catch (error) {
            // If we can't determine the round, start from 0
            return 0;
        }
    }

    // Fisher–Yates Shuffle - https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    private async shuffleArray(array: number[]): Promise<number[]> {
        for (let i = array.length - 1; i > 0; i--) {
            // Generate a random index j such that 0 ≤ j ≤ i
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements at indices i and j
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // every element appears exactly once
    private async getNonOverlappingPairs(userIds: number[]): Promise<[number, number][]> {
        const pairs: [number, number][] = [];
        for (let i = 0; i < userIds.length - 1; i += 2) {
            pairs.push([userIds[i], userIds[i + 1]]);
        }

        // Log if there's an odd number of users
        if (userIds.length % 2 !== 0) {
            this.logger.warn(`Event has odd number of users (${userIds.length}). User ${userIds[userIds.length - 1]} will not be paired this round.`);
        }

        return pairs;
    }
}
