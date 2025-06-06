import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() user: RegisterUserDto): Promise<UserDto> {
        return await this.usersService.registerUser(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':email')
    async getByEmail(@Param('email') email: string): Promise<UserDto> {
        return await this.usersService.findByEmail(email);
    }
}
