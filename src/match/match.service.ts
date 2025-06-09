import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entity/match.entity';
import { EventService } from 'src/event/event.service';
import { MailService } from 'src/mail/mail.service';
import { ViewEventResponseDto } from './dto/view-event-response.dto';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { MatchAssignmentException } from 'src/common/exceptions/match-assignment.exception';
import { EmailServiceException } from 'src/common/exceptions/email-service.exception';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private readonly matchRepo: Repository<Match>,
        private readonly eventService: EventService,
        private readonly mailService: MailService,
        private readonly logger = new Logger(MatchService.name)
    ) { }

    // TODO: try catch and exception handling nad logging
    async joinEvent(userId: number, roleId: number, eventId: number) {
        try {
            // Validate inputs
            if (!userId || !eventId) {
                throw new BadRequestException('User ID and Event ID are required');
            }

            if (roleId === UserRoles.ADMIN) {
                throw new BadRequestException('Admins cannot join the event. That would be cheating');
            }

            // Check if user is already in the event
            const userEvent = await this.eventService.findUserEvent(userId, eventId);
            if (userEvent) {
                throw new ConflictException(
                    `User ${userId} is already registered for event ${eventId}`
                );
            }

            // Create the user-event relationship
            // TODO: create proper output
            return await this.eventService.createUserEvent(userId, eventId);
        } catch (error) {
            // Re-throw known exceptions
            if (error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                `Failed to join event: ${error.message}`
            );
        }
    }



    async view(userId: number, eventId: number): Promise<ViewEventResponseDto> {
        try {
            // Validate inputs
            if (!userId || !eventId) {
                throw new BadRequestException('User ID and Event ID are required');
            }

            const match = await this.matchRepo.findOne({
                order: {
                    round_number: "DESC"
                },
                where: [
                    { user1_id: userId, event_id: eventId },
                    { user2_id: userId, event_id: eventId }
                ],
                relations: ['user1', 'user2']
            });

            if (!match) { throw new NotFoundException('Match not found'); }
            const viewEventResponse: ViewEventResponseDto = new ViewEventResponseDto();
            viewEventResponse.matchName = match.user1_id === userId ? match.user2.name : match.user1.name;
            return viewEventResponse;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                `Failed to retrieve match: ${error.message}`
            );
        }

    }

    async assign(eventId: number): Promise<any> {

        // Validate input
        if (!eventId || eventId <= 0) {
            throw new MatchAssignmentException(
                'Valid Event ID is required',
                'INVALID_EVENT_ID',
                400
            );
        }

        // Get all event users
        const userEvents = await this.eventService.findAllEventUsers(eventId);
        if (!userEvents || userEvents.length === 0) {
            throw new MatchAssignmentException(
                `No users registered for event ${eventId}`,
                'NO_USERS_FOUND', 404);

        }

        const user_ids = userEvents.map(user => user.user_id);
        // Check if we have enough users for pairing
        if (user_ids.length < 2) {
            throw new MatchAssignmentException(
                `Insufficient users for matching. Found ${user_ids.length} users, minimum required: 2`,
                'INSUFFICIENT_USERS',
                400
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
                400
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
        userEvents: any[]
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
                    return await this.mailService.sendMatchMail(
                        userEvent.user.email,
                        userEvent.user.name,
                        matchedUser.user.name,
                        userEvent.event.location,
                    );
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
            console.warn(`Event has odd number of users (${userIds.length}). User ${userIds[userIds.length - 1]} will not be paired this round.`);
        }

        return pairs;
    }
}
