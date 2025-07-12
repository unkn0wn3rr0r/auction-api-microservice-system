import { Module } from '@nestjs/common';
import { MONGO_CLIENT, mongoClientProvider } from './mongo-client';
import { AuctionRepository } from './auction.repository';

@Module({
  providers: [
    {
      provide: MONGO_CLIENT,
      useFactory: mongoClientProvider,
    },
    AuctionRepository,
  ],
  exports: [AuctionRepository],
})
export class PersistenceModule { }
