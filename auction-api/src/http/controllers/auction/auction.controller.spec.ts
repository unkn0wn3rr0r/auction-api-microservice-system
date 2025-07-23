import { Test, TestingModule } from '@nestjs/testing';
import { AuctionController } from './auction.controller';
import { AuctionService } from 'src/core/services/auction/auction.service';
import { AuctionItem } from 'src/utils/models/auction';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

describe('AuctionController', () => {
    let controller: AuctionController;
    let service: AuctionService;

    const mockAuctionService = {
        findAllAuctionItems: jest.fn(),
        createAuctionItem: jest.fn(),
        searchAuctionItems: jest.fn(),
        findAuctionItemById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuctionController],
            providers: [
                {
                    provide: AuctionService,
                    useValue: mockAuctionService,
                },
            ],
        }).compile();

        controller = module.get(AuctionController);
        service = module.get(AuctionService);

        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of auction items', async () => {
            const items: AuctionItem[] = [{ id: '1', name: 'Item1' } as unknown as AuctionItem];
            mockAuctionService.findAllAuctionItems.mockResolvedValue(items);

            const result = await controller.findAll('10', '0');
            expect(result).toEqual(items);
            expect(service.findAllAuctionItems).toHaveBeenCalledWith(10, 0);
            expect(service.findAllAuctionItems).toHaveBeenCalledTimes(1);
        });

        it('should throw BadRequestException if limit or skip is not a number', async () => {
            await expect(controller.findAll('not-a-number', '0')).rejects.toThrow(BadRequestException);
            await expect(controller.findAll('10', 'not-a-number')).rejects.toThrow(BadRequestException);
        });
    });

    describe('create', () => {
        it('should create and return an auction item', async () => {
            const newItem = { id: '1', name: 'New Item' } as unknown as AuctionItem;
            mockAuctionService.createAuctionItem.mockResolvedValue(newItem);

            const result = await controller.create(newItem);
            expect(result).toEqual(newItem);
            expect(service.createAuctionItem).toHaveBeenCalledWith(newItem);
            expect(service.createAuctionItem).toHaveBeenCalledTimes(1);
        });
    });

    describe('search', () => {
        it('should throw BadRequestException if search query is not provided', async () => {
            await expect(controller.search('')).rejects.toThrow(new BadRequestException('Search query "q" must be provided.'));
            await expect(controller.search('   ')).rejects.toThrow(new BadRequestException('Search query "q" must be provided.'));
            await expect(controller.search(undefined as any)).rejects.toThrow(new BadRequestException('Search query "q" must be provided.'));
            await expect(controller.search(null as any)).rejects.toThrow(new BadRequestException('Search query "q" must be provided.'));
            expect(service.searchAuctionItems).toHaveBeenCalledTimes(0);
        });

        it('should return array of items matching search query', async () => {
            const foundItems: AuctionItem[] = [{ id: '1', name: 'Found Item' } as unknown as AuctionItem];
            mockAuctionService.searchAuctionItems.mockResolvedValue(foundItems);

            const result = await controller.search('porcelain');
            expect(result).toEqual(foundItems);
            expect(service.searchAuctionItems).toHaveBeenCalledWith('porcelain');
            expect(service.searchAuctionItems).toHaveBeenCalledTimes(1);
        });
    });

    describe('findById', () => {
        it('should throw BadRequestException for invalid ObjectId', async () => {
            await expect(controller.findById('invalid id')).rejects.toThrow(new BadRequestException('Invalid id parameter: invalid id'));
            await expect(controller.findById('')).rejects.toThrow(new BadRequestException('Invalid id parameter: '));

            expect(service.findAuctionItemById).toHaveBeenCalledTimes(0);
        });

        it('should throw NotFoundException if item was not found', async () => {
            const id = new ObjectId();
            mockAuctionService.findAuctionItemById.mockResolvedValue(null);

            await expect(controller.findById(id.toHexString())).rejects.toThrow(NotFoundException);
            expect(service.findAuctionItemById).toHaveBeenCalledTimes(1);
        });

        it('should return an auction item by id', async () => {
            const id = new ObjectId();
            const item: AuctionItem = { id, name: 'Item123' } as unknown as AuctionItem;
            mockAuctionService.findAuctionItemById.mockResolvedValue(item);

            const result = await controller.findById(id.toHexString());
            expect(result).toEqual(item);
            expect(service.findAuctionItemById).toHaveBeenCalledWith(id.toHexString());
            expect(service.findAuctionItemById).toHaveBeenCalledTimes(1);
        });
    });
});
