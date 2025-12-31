import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateChatroomInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;
}
