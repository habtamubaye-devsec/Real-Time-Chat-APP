import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { MessageModule } from './message/message.module';

import { TokenService } from './token/token.service';
import { TokenModule } from './token/token.module';

// ...existing code...

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Make TokenService available app-wide
    TokenModule,

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      // IMPORTANT: TokenService must come from an imported module here
      imports: [ConfigModule, TokenModule],
      inject: [ConfigService, TokenService],
      driver: ApolloDriver,
      useFactory: async (_configService: ConfigService, tokenService: TokenService) => {
        return {
          installSubscriptionHandlers: true,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          playground: true,
          sortSchema: true,
          subscriptions: {
            'graphql-ws': {
              onConnect: (context) => {
                const token = tokenService.extractToken(context.connectionParams);
                if (!token) {
                  throw new Error('Token not provided');
                }

                const user = tokenService.validateToken(token);
                if (!user) {
                  throw new Error('Invalid token');
                }

                return { user };
              },
            },
          },
        };
      },
    }),

    AuthModule,
    UserModule,
    UploadModule,
    ChatroomModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}