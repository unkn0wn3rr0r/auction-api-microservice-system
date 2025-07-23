import { Module } from '@nestjs/common';
import { mongoClientProvider } from './client/mongo-client';
import { MongoAuctionRepository } from './repositories/auction/mongo.auction.repository';
import { AuctionRepository } from '../utils/models/auction';
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
