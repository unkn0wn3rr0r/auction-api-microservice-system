import { Module } from '@nestjs/common';
import { MONGO_CLIENT, mongoClientProvider } from './mongo-client';
import { MongoAuctionRepository } from './auction.repository';
import { AuctionRepository } from '../models/auction';

@Module({
  providers: [
    {
      provide: MONGO_CLIENT,
      useFactory: mongoClientProvider,
    },
    {
      provide: AuctionRepository,
      useClass: MongoAuctionRepository,
    }
  ],
  exports: [AuctionRepository],
})
export class PersistenceModule { }
