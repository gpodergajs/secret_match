import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('register')
    async register(@Body() user: RegisterUserDto): Promise<User> {
        try {
            return await this.usersService.registerUser(user);
        } catch(error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    // TODO: create login dto and auth service flow
    @Post('login')
    async login(@Body() loginRequest: LoginRequestDto): Promise<any> {
        try {
            return await this.usersService.getUserByEmailAndPassword(loginRequest.email, loginRequest.password);
        }  catch(error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    @Get(':email')
    async getByEmail(@Param('email') email: string): Promise<UserDto> {
        try {
            // omit the password retrieval
            const user = await this.usersService.getUserByEmail(email);
            const { password, ...userDto } = user;
            return userDto;
        } catch(error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

  
}
