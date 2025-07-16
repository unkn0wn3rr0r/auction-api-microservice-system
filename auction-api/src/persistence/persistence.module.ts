import { Module } from '@nestjs/common';
import { mongoClientProvider } from './mongo-client';
import { MongoAuctionRepository } from './auction.repository';
import { AuctionRepository } from '../models/auction';
import { MONGO_CLIENT } from 'src/utils/constants';

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
