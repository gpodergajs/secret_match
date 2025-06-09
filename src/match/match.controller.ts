import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { MatchService } from './match.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { ViewEventQueryDto } from './dto/view-event-query.dto';
import { JoinEventDto } from './dto/join-event.dto';
import { AssignMatchesDto } from './dto/assign-matches.dto';
import { MatchAssignmentExceptionFilter } from 'src/common/filters/match-asignment-exception.filter';
import { JoinEventExceptionFilter } from 'src/common/filters/join-event.filter';
import { ViewEventExceptionFilter } from 'src/common/filters/view-event-exception.filter';
import { EmailServiceExceptionFilter } from 'src/common/filters/email-service-exception.filter';
import { EventServiceExceptionFilter } from 'src/common/filters/event-service-exception.filter';

@Controller('match')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseFilters(EventServiceExceptionFilter)
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @Post('join')
    @UseFilters(JoinEventExceptionFilter)
    @HttpCode(HttpStatus.CREATED)
    async joinEvent(@Body() joinEventDto: JoinEventDto, @Req() req: any) {
        return await this.matchService.joinEvent(req.user.userId, req.user.role, joinEventDto.eventId)
    }

    @Get('view')
    @UseFilters(ViewEventExceptionFilter)
    @HttpCode(HttpStatus.OK)
    async viewEvent(@Query() query: ViewEventQueryDto, @Req() req: any) {
        return await this.matchService.view(req.user.userId, query.eventId)
    }

    @Post('assign')
    @Roles(UserRoles.ADMIN)
    @UseFilters(MatchAssignmentExceptionFilter, EmailServiceExceptionFilter)
    @HttpCode(HttpStatus.CREATED)
    async assign(@Body() assignDto: AssignMatchesDto) {
        return await this.matchService.assign(assignDto.eventId)
    }
}



