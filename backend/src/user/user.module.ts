import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma.module';
import { UploadModule } from 'src/upload/upload.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, UploadModule, AuthModule],
  providers: [UserResolver, UserService, PrismaService,  JwtService]
})
export class UserModule {}
