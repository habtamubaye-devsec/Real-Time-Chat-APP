import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  chatroomId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
