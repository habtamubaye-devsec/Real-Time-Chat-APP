import { Args, Context, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';

import { PUB_SUB } from '../pubsub/pubsub.constants';
import { GraphqlAuthGuard } from '../auth/grapghql-auth.guard';
import { Message } from './message.type';
import { MessageService } from './message.service';
import { SendMessageInput } from './message.dto';

type AuthedRequest = ExpressRequest & { user?: { sub?: number } };

type PubSubLike = {
  publish: (triggerName: string, payload: unknown) => Promise<void> | void;
  asyncIterator: (triggerName: string | string[]) => AsyncIterator<unknown>;
};

const MESSAGE_ADDED = 'messageAdded';

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    @Inject(PUB_SUB) private readonly pubSub: PubSubLike,
  ) {}

  @Query(() => [Message])
  messages(@Args('chatroomId') chatroomId: string) {
    return this.messageService.listByChatroom(chatroomId);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Message)
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context: { req: AuthedRequest },
  ) {
    const userId = context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const message = await this.messageService.send(
      userId,
      input.chatroomId,
      input.content,
      input.imageUrl,
    );

    await this.pubSub.publish(MESSAGE_ADDED, {
      messageAdded: message,
    });

    return message;
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => {
      return String(payload.messageAdded.chatroomId) === String(variables.chatroomId);
    },
  })
  messageAdded(@Args('chatroomId') chatroomId: string) {
    return this.pubSub.asyncIterator(MESSAGE_ADDED);
  }
}
