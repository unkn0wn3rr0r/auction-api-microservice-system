import { Injectable } from '@nestjs/common';
import { AuctionRepository } from 'src/persistence/auction.repository';
import { AuctionItem } from 'src/models/auction-item';

@Injectable()
export class AuctionService {
  constructor(private readonly repository: AuctionRepository) { }

  async findAllAuctionItems(limit = 10, skip = 0): Promise<AuctionItem[]> {
    return this.repository.findAllAuctionItems(limit, skip);
  }

  async findAuctionItemById(id: string): Promise<AuctionItem | null> {
    return this.repository.findAuctionItemById(id);
  }

  async createAuctionItem(item: AuctionItem): Promise<AuctionItem> {
    return this.repository.createAuctionItem(item);
  }

  async searchAuctionItems(query: string): Promise<AuctionItem[]> {
    return this.repository.searchAuctionItems(query);
  }
}
