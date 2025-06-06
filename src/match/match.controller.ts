import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MatchService } from './match.service';
import { Roles } from 'src/common/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoles } from 'src/common/user-roles.enum';

@Controller('match')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    @UseGuards(JwtAuthGuard)
    @Post('join')
    @HttpCode(HttpStatus.CREATED)
    async joinEvent(@Body() matchJoinDto: any) {
        return this.matchService.joinEvent(matchJoinDto.userId, matchJoinDto.eventId)

        //return this.matchService.join(userId, round);
    }

    @UseGuards(JwtAuthGuard)
    @Get('view')
    @HttpCode(HttpStatus.OK)
    async viewEvent(@Query('userId', ParseIntPipe) userId: number,
        @Query('eventId', ParseIntPipe) eventId: number,
        @Req() req: any) {
     
        if(req.user.userId !== userId) {
            throw new ForbiddenException('You are not authorized to access this data');
        }    
        return this.matchService.view(userId, eventId)
    }

    // TODO: create role guards
    @Post('assign')
    @Roles(UserRoles.ADMIN)
    @HttpCode(HttpStatus.OK)
    async assign(@Body() assignDto: any) {
        return this.matchService.assign(assignDto.eventId);
    }
}



