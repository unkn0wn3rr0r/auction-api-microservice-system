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
