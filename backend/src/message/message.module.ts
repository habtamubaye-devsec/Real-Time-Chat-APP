import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { PubSubModule } from '../pubsub/pubsub.module';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [PubSubModule],
  providers: [MessageResolver, MessageService, PrismaService],
})
export class MessageModule {}
