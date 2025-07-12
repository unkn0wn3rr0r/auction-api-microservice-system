import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuctionItem } from 'src/models/auction-item';
import { AuctionService } from 'src/services/auction.service';

@Controller('/items')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) { }

  @Get('/')
  async findAll(
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ): Promise<AuctionItem[]> {
    const l = Number(limit);
    const s = Number(skip);
    if (isNaN(l) || isNaN(s)) {
      throw new BadRequestException('limit and skip should be of type number');
    }
    return this.auctionService.findAllAuctionItems(l, s);
  }

  @Post('/new')
  async create(@Body() item: AuctionItem): Promise<AuctionItem> {
    return this.auctionService.createAuctionItem(item);
  }

  @Get('/search')
  async search(@Query('q') q: string): Promise<AuctionItem[]> {
    return this.auctionService.searchAuctionItems(q);
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<AuctionItem> {
    const item = await this.auctionService.findAuctionItemById(id);
    if (item == null) {
      throw new NotFoundException(`Item with id: ${id} was not found.`);
    }
    return item;
  }
}
