
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from 'src/users/dto/login-request.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  // intercepts the login flow - validates the user before continuing
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(new LoginRequestDto(email, password));
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
