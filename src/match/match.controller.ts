import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { MatchService } from './match.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { ViewEventQueryDto } from './dto/view-event-query.dto';
import { JoinEventDto } from './dto/join-event.dto';
import { AssignMatchesDto } from './dto/assign-matches.dto';

@Controller('match')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @Post('join')
    @HttpCode(HttpStatus.CREATED)
    async joinEvent(@Body() joinEventDto: JoinEventDto, @Req() req: any) {
        return await this.matchService.joinEvent(req.user.userId, req.user.role, joinEventDto.eventId)
    }

    @Get('view')
    @HttpCode(HttpStatus.OK)
    async viewEvent(@Query() query: ViewEventQueryDto, @Req() req: any) {
        return await this.matchService.view(req.user.userId, query.eventId)
    }

    // TODO: create role guards
    @Post('assign')
    @Roles(UserRoles.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async assign(@Body() assignDto: AssignMatchesDto) {
        return await this.matchService.assign(assignDto.eventId)
    }
}



