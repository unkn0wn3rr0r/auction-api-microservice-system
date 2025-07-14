import { ObjectId } from 'mongodb';

enum AuctionItemStatus {
  Upcoming = 'upcoming',
  Ongoing = 'ongoing',
  Completed = 'completed',
}

export interface AuctionItemBase {
  title: string;
  description: string;
  category: string;
  status: AuctionItemStatus;
}

export interface AuctionItem extends AuctionItemBase {
  _id?: ObjectId;
  estimated_value: number;
  created_at: Date;
}

export interface AuctionItemCsvFormat extends AuctionItemBase {
  price: number;
}

/*
  If we want to switch from MongoDB to SQL in the future, we can abstract our repository logic behind an interface,
  so our application code (controllers/services) is decoupled from the database implementation.
*/
export abstract class AuctionRepository {
  abstract findAuctionItemById(id: string): Promise<AuctionItem | null>;
  abstract findAllAuctionItems(limit?: number, skip?: number): Promise<AuctionItem[]>;
  abstract createAuctionItem(item: AuctionItem): Promise<AuctionItem>;
  abstract searchAuctionItems(query: string): Promise<AuctionItem[]>;
  abstract insertCsvData(items: AuctionItem[]): Promise<void>;
  abstract isHealthy(): Promise<boolean>;
}
