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
import { ObjectId } from 'mongodb';
import { AuctionItem } from 'src/models/auction';
import { AuctionService } from 'src/services/auction.service';

@Controller('/items')
export class AuctionController {
  constructor(private readonly service: AuctionService) { }

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
    return this.service.findAllAuctionItems(l, s);
  }

  @Post('/new')
  async create(@Body() item: AuctionItem): Promise<AuctionItem> {
    return this.service.createAuctionItem(item);
  }

  @Get('/search')
  async search(@Query('q') query: string): Promise<AuctionItem[]> {
    if (!query?.trim()) {
      throw new BadRequestException('Search query "q" must be provided.');
    }
    return this.service.searchAuctionItems(query);
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<AuctionItem> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid id parameter: ${id}`);
    }
    const item = await this.service.findAuctionItemById(id);
    if (item == null) {
      throw new NotFoundException(`Item with id: ${id} was not found.`);
    }
    return item;
  }
}
