import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const config = this.configService.get('app');
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: string): Promise<'OK'> {
    return await this.redis.set(key, value);
  }

  async setJson(key: string, value: any): Promise<'OK'> {
    return await this.redis.set(key, JSON.stringify(value));
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    return await this.redis.setex(key, seconds, value);
  }

  async setexJson(key: string, seconds: number, value: any): Promise<'OK'> {
    return await this.redis.setex(key, seconds, JSON.stringify(value));
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  async flushdb(): Promise<'OK'> {
    return await this.redis.flushdb();
  }
}
