import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Chatroom } from './chatroom.type';
import { ChatroomService } from './chatroom.service';
import { CreateChatroomInput } from './chatroom.dto';

@Resolver(() => Chatroom)
export class ChatroomResolver {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Query(() => [Chatroom])
  chatrooms(): Promise<Chatroom[]> {
    return this.chatroomService.list();
  }

  @Mutation(() => Chatroom)
  createChatroom(@Args('input') input: CreateChatroomInput): Promise<Chatroom> {
    return this.chatroomService.create(input.name);
  }
}
