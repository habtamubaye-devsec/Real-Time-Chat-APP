import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.type';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from 'src/auth/grapghql-auth.guard';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadFileInput, UploadedFile } from '../upload/upload.type';
import { UploadService } from '../upload/upload.service';


type AuthedRequest = ExpressRequest & { user?: { sub?: string } };

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async uploadProfile(
    @Args('fullName') fullName: string,
    @Args('file') file: UploadFileInput,
    @Context() context: { req: AuthedRequest; res: ExpressResponse },
  ) {
    const userId = context.req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const saved = await this.uploadService.saveBase64File(file);
    return this.userService.updateProfile(userId, fullName, saved.url);
  }

  private async storeAndGetUrl(file: UploadFileInput): Promise<string> {
    const { createReadStream, filename } = await (file as any);
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const imagePath = join(process.cwd(), 'public', uniqueFilename);

    const baseUrl = (process.env.APP_URL ?? '').replace(/\/$/, '');
    const imageUrl = `${baseUrl}/${uniqueFilename}`;

    await new Promise<void>((resolve, reject) => {
      const readStream = createReadStream();
      readStream
        .pipe(createWriteStream(imagePath))
        .on('finish', () => resolve())
        .on('error', (err) => reject(err));
    });

    return imageUrl;
  }
}