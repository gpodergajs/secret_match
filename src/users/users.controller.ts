import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    async register(@Body() user: RegisterUserDto): Promise<Omit<User, "password">> {
        try {
            return await this.usersService.registerUser(user);
        } catch(error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':email')
    async getByEmail(@Param('email') email: string): Promise<UserDto> {
        try {
            // omit the password retrieval
            const user = await this.usersService.findByEmail(email);
            const { password: password, ...userDto } = user;
            return userDto;
        } catch(error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }
}
