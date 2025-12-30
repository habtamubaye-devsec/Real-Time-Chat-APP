import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma.module';
import { GraphqlAuthGuard } from './grapghql-auth.guard';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (_configService: ConfigService) => ({
        // AuthService passes secrets explicitly to sign/verify.
      }),
    }),
  ],
  providers: [AuthResolver, AuthService, GraphqlAuthGuard],
  exports: [AuthService, JwtModule, GraphqlAuthGuard],
})
export class AuthModule {}