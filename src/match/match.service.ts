import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Match } from './entity/match.entity';
import { User } from 'src/users/entity/user.entity';
import { Event } from 'src/event/event.entity'
import { UsersEvents } from 'src/event/user-events.entity';
import { EventService } from 'src/event/event.service';
import { MailService } from 'src/mail/mail.service';
import { use } from 'passport';
import { ViewEventResponseDto } from './dto/view-event-response.dto';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(Match)
        private readonly matchRepo: Repository<Match>,
        private readonly eventService: EventService,
        private readonly mailService: MailService
    ) { }

    // TODO: try catch and exception handling nad logging
    async joinEvent(userId: number, eventId: number) {
        try {
            // Validate inputs
            if (!userId || !eventId) {
                throw new BadRequestException('User ID and Event ID are required');
            }

            // Check if user is already in the event
            const userEvent = await this.eventService.findUserEvent(userId, eventId);
            if (userEvent) {
                throw new ConflictException(
                    `User ${userId} is already registered for event ${eventId}`
                );
            }

            // Create the user-event relationship
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
        try {
            // Validate input
            if (!eventId) {
                throw new BadRequestException('Event ID is required');
            }

            // Get all event users
            const userEvents = await this.eventService.findAllEventUsers(eventId);

            if (!userEvents || userEvents.length === 0) {
                throw new NotFoundException(`No users found for event ${eventId}`);
            }

            const user_ids = userEvents.map(user => user.user_id);

            // Check if we have enough users for pairing
            if (user_ids.length < 2) {
                throw new BadRequestException(
                    `Not enough users to create matches. Found ${user_ids.length} users, need at least 2`
                );
            }

            // Get current round number
            const currentRound = await this.getCurrentRoundNumber(eventId);
            const nextRound = currentRound + 1;

            // Shuffle before pairing for randomization
            const shuffled_user_ids: number[] = this.shuffleArray([...user_ids]); // Create copy to avoid mutation
            const pairs: [number, number][] = this.getNonOverlappingPairs(shuffled_user_ids);

            if (pairs.length === 0) {
                throw new BadRequestException('Unable to create any valid pairs');
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
            for (const savedMatch of savedMatches) {
                const pair = userEvents.filter(u =>
                    [savedMatch.user1_id, savedMatch.user2_id].includes(u.user_id),
                );

                const sendEmails = pair.map(userEvent => {
                    const matchedUser = pair.find(u => u.user_id !== userEvent.user_id)!;

                    return this.mailService.sendMatchMail(
                        userEvent.user.email,
                        userEvent.user.name,
                        matchedUser.user.name,
                        userEvent.event.location,
                    );
                });


                await Promise.all(sendEmails);
            }

            return savedMatches;
        } catch (error) {
            // Re-throw known exceptions
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof InternalServerErrorException
            ) {
                throw error;
            }

            // Handle database constraint violations
            if (error.code === '23505') { // Unique constraint violation
                throw new ConflictException(
                    'Matches for this round already exist'
                );
            }

            if (error.code === '23503') { // Foreign key constraint
                throw new NotFoundException(
                    'One or more users/events not found'
                );
            }

            throw new InternalServerErrorException(
                `Failed to assign matches: ${error.message}`
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
    private shuffleArray(array: number[]): number[] {
        for (let i = array.length - 1; i > 0; i--) {
            // Generate a random index j such that 0 ≤ j ≤ i
            const j = Math.floor(Math.random() * (i + 1));
            // Swap elements at indices i and j
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // every element appears exactly once
    private getNonOverlappingPairs(userIds: number[]): [number, number][] {
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
