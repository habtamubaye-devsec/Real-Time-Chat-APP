import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UploadService } from './upload.service';
import { UploadedFile, UploadFileInput } from './upload.type';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Query(() => String)
  ping(): string {
    return 'pong';
  }

  @Mutation(() => UploadedFile)
  uploadFile(@Args('input') input: UploadFileInput): Promise<UploadedFile> {
    return this.uploadService.saveBase64File(input);
  }
}
