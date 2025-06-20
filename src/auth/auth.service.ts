import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequestDto } from 'src/users/dto/login-request.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
         @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ){}

    // check if user with email and password combo exists, else throw exceptions
    async validateUser(loginRequest: LoginRequestDto): Promise<UserDto> {
        const bcrypt = require('bcrypt')
        const { email, password } = loginRequest
        const user = await this.userRepository.findOne({where: {email: email}, relations: ['role']})
        
        if(!user) throw new NotFoundException();

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new UnauthorizedException();

        const { password: passwordHash, ...userDto } = user;
        return userDto;
    }

    // signs the payload and returns a jwt token (access token)
    async login(user: any) {
        const payload = {email: user.email, sub: user.id, role: user.role};
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}
