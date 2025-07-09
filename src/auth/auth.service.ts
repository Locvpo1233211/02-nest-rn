import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '@/users/users.service';
import { comparePassword } from '@/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    console.log(user.password);
    const isPasswordValid = await comparePassword(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (user && isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async login(user: any, res: Response) {
    const payload = {
      username: user.name,
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN'),
    });

    await res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: Number(ms(this.configService.get('REFRESH_TOKEN_EXPIRES_IN'))),
    });

    await this.usersService.updateUserRefeshToken(refreshToken, user._id);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      role: user.role,
      email: user.email,
      name: user.name,
      _id: user._id,
    };
  }
  async register(body: any) {
    return this.usersService.handleRegister(body);
  }

  async refreshToken(request: Request) {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const decoded = this.jwtService.verify(refreshToken);
    const user = await this.usersService.findUserByEmail(decoded.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const payload = {
      username: user.name,
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      secret: this.configService.get('JWT_SECRET'),
    });

    return {
      access_token: newAccessToken,
    };
  }
  async logout(user: any, res: Response) {
    await this.usersService.updateUserRefeshToken('', user.userId);
    await res.clearCookie('refreshToken');

    return {
      message: 'Logout successfully',
    };
  }
}
