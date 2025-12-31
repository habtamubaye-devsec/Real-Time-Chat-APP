import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { ChatroomResolver } from './chatroom.resolver';
import { ChatroomService } from './chatroom.service';

@Module({
  providers: [ChatroomResolver, ChatroomService, PrismaService],
  exports: [ChatroomService],
})
export class ChatroomModule {}
