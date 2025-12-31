import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Chatroom {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
