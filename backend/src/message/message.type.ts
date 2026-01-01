import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.type';

@ObjectType()
export class Message {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  userId: string;

  @Field()
  chatroomId: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field(() => User, { nullable: true })
  user?: User;
}
