import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    let payload;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!userExists) {
      throw new BadRequestException('User no longer exists');
    }

    const expiresIn = 150000;
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;

    const accessToken = this.jwtService.sign(
      { ...payload, exp: expiration },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        // expiresIn: expiresIn / 1000,
      },
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      // secure: this.configService.get<string>('NODE_ENV') === 'production',
      // sameSite: 'lax',
      // maxAge: expiresIn,
    });

    return accessToken;
  }

  private async issueTokens(user: User, response: Response) {
    const payload = { username: user.fullName, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: '150s',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    response.cookie('access_token', accessToken, {
      httpOnly: true,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
    });

    return { user, accessToken, refreshToken };
  }

  async validateUser(LoginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: LoginDto.email },
    });

    if (user && (await bcrypt.compare(LoginDto.password, user.password))) {
      return user;
    }
    return null;
  }

  async register(registerDto: RegisterDto, response: Response) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: hashedPassword,
      },
    });

    return this.issueTokens(user, response);
  }

  async login(response: Response, loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    return this.issueTokens(user, response);
  }

  async logout(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
}
