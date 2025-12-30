import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, RegisterResponse } from './types';
import { LoginDto, RegisterDto } from './dto';
import { BadRequestException } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto,
    @Context() context: { res: ExpressResponse },
  ) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'Passwords do not match.',
      });
      const { user } = await this.authService.register(
        registerDto,
        context.res,
      );
      return { user };
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto,
    @Context() context: { res: ExpressResponse },
  ) {
    return this.authService.login(context.res, loginDto);
  }

  @Mutation(() => String)
  async logout(@Context() context: { res: ExpressResponse }) {
    const result = await this.authService.logout(context.res);
    return result.message;
  }

  @Query(() => String)
  helloAuth(): string {
    return 'Hello from AuthResolver';
  }

  @Mutation(() => String)
  async refreshToken(
    @Context() context: { req: ExpressRequest; res: ExpressResponse },
  ) {
    return this.authService.refreshToken(context.req, context.res);
  }
}
