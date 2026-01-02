import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';
import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';

import { PUB_SUB } from './pubsub.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('PubSub');

        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          logger.warn('REDIS_URL not set; using in-memory PubSub');
          return new PubSub();
        }

        const redisOptions: RedisOptions = {
          lazyConnect: true,
          maxRetriesPerRequest: null,
          retryStrategy: (attempt) => Math.min(250 * 2 ** (attempt - 1), 30_000),
        };

        const publisher = new Redis(redisUrl, redisOptions);
        const subscriber = new Redis(redisUrl, redisOptions);

        let lastErrorLogAtMs = 0;
        const logRedisError = (clientName: 'publisher' | 'subscriber', error: unknown) => {
          const now = Date.now();
          if (now - lastErrorLogAtMs < 10_000) return;
          lastErrorLogAtMs = now;

          const message = error instanceof Error ? error.message : String(error);
          logger.error(`Redis ${clientName} error: ${message}`);
        };

        publisher.on('error', (err) => logRedisError('publisher', err));
        subscriber.on('error', (err) => logRedisError('subscriber', err));

        publisher.on('ready', () => logger.log('Redis publisher ready'));
        subscriber.on('ready', () => logger.log('Redis subscriber ready'));

        void publisher.connect().catch((err) => logRedisError('publisher', err));
        void subscriber.connect().catch((err) => logRedisError('subscriber', err));

        return new RedisPubSub({ publisher, subscriber });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}

