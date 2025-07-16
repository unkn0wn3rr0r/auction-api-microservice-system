import { Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { DATABASE_NAME, MONGO_URL } from 'src/utils/constants';

export async function mongoClientProvider(): Promise<Db> {
  const logger = new Logger('MongoClientProvider');
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    logger.debug(`Connected to MongoDB at ${MONGO_URL}`);
    return client.db(DATABASE_NAME);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}
