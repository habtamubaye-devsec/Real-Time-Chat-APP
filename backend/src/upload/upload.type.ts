import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class UploadFileInput {
  @Field()
  filename: string;

  @Field()
  base64: string;
}

@ObjectType()
export class UploadedFile {
  @Field()
  filename: string;

  @Field()
  url: string;
}
