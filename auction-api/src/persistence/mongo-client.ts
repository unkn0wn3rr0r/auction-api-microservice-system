import { Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

export const DATABASE_NAME = 'auctiondb';
export const MONGO_CLIENT = Symbol('mongo-client');
export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://db:27017';

export async function mongoClientProvider(): Promise<Db> {
  const logger = new Logger();
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  logger.debug(`Connected to MongoDB - ${DATABASE_NAME}`);
  return client.db(DATABASE_NAME);
}
