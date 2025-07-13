import { Inject, Injectable, Logger } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { AuctionItem } from 'src/models/auction-item';
import { MONGO_CLIENT } from './mongo-client';

@Injectable()
export class AuctionRepository {
  private readonly logger = new Logger(AuctionRepository.name);
  private auctionCollection: Collection<AuctionItem>;

  constructor(@Inject(MONGO_CLIENT) private readonly db: Db) {
    this.auctionCollection = this.db.collection<AuctionItem>('auction_items');
  }

  async findAuctionItemById(id: string): Promise<AuctionItem | null> {
    return this.auctionCollection.findOne({ _id: new ObjectId(id) });
  }

  async findAllAuctionItems(limit = 10, skip = 0): Promise<AuctionItem[]> {
    return this.auctionCollection.find().skip(skip).limit(limit).toArray();
  }

  async createAuctionItem(item: AuctionItem): Promise<AuctionItem> {
    const result = await this.auctionCollection.insertOne({
      ...item,
      _id: new ObjectId(),
    });
    if (!result.acknowledged) {
      throw new Error(`Creating auction item - ${item.title} failed`);
    }
    return { ...item, _id: result.insertedId };
  }

  async searchAuctionItems(query: string): Promise<AuctionItem[]> {
    return this.auctionCollection
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .toArray();
  }

  async insertCsvData(items: AuctionItem[]): Promise<void> {
    const result = await this.auctionCollection.insertMany(items);
    if (!result.acknowledged) {
      throw new Error('Inserting CSV data failed');
    }
    if (result.insertedCount !== items.length) {
      this.logger.warn(`There was a mismatch while inserting CSV data - ${result.insertedCount} out of ${items.length} items`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.db.command({ ping: 1 });
      return result.ok === 1;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }
}

// docker-compose up --build
// docker-compose down -v && docker-compose up --build - this deletes the db
