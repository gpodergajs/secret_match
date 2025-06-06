import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { MatchService } from './match.service';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/common/user-roles.enum';
import { ViewEventQueryDto } from './dtos/view-event-query.dto';
import { JoinEventDto } from './dtos/join-event.dto';
import { AssignMatchesDto } from './dtos/assign-matches.dto';

@Controller('match')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @Post('join')
    @HttpCode(HttpStatus.CREATED)
    async joinEvent(@Body() joinEventDto: JoinEventDto) {
        return await this.matchService.joinEvent(joinEventDto.userId, joinEventDto.eventId)
    }

    @Get('view')
    @HttpCode(HttpStatus.OK)
    async viewEvent(@Query() query: ViewEventQueryDto, @Req() req: any) {
        if (req.user.userId !== query.userId) {
            throw new ForbiddenException('You are not authorized to access this data');
        }
        return await this.matchService.view(query.userId, query.eventId)
    }

    // TODO: create role guards
    @Post('assign')
    @Roles(UserRoles.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async assign(@Body() assignDto: AssignMatchesDto) {
        return await this.matchService.assign(assignDto.eventId)
    }
}



