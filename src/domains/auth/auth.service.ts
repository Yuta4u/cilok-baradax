import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  public passwordVerify(hash: string, password: string) {
    return bcrypt.compare(password, hash);
  }

  public async login(payload: AuthLoginDto) {
    const user = await this.userService.readByEmail(payload.email);
    const userPassword = user?.password ?? '';
    const result = await this.passwordVerify(userPassword, payload.password);
    if (!user?.password || !result)
      throw new UnauthorizedException('Email Or Password not match');

    const expiresIn = user.name === 'Production' ? '365d' : '6h';

    return {
      accessToken: this.jwtService.sign(
        {
          sub: user.id,
          perm: user.permission,
        },
        { expiresIn },
      ),
      user,
    };
  }

  public async getProfile(id: string) {
    const user = await this.userService.findOne(id);
    return user;
  }
}
