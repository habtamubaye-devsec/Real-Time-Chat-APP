import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

import { PUB_SUB } from './pubsub.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';

        const publisher = new Redis(redisUrl);
        const subscriber = new Redis(redisUrl);

        return new RedisPubSub({
          publisher,
          subscriber,
        });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
