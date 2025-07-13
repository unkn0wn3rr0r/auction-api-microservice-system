import { Test, TestingModule } from '@nestjs/testing';
import { AuctionController } from './auction.controller';
import { AuctionService } from 'src/services/auction.service';
import { AuctionItem } from 'src/models/auction-item';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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

        controller = module.get<AuctionController>(AuctionController);
        service = module.get<AuctionService>(AuctionService);

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
        it('should return array of items matching search query', async () => {
            const foundItems: AuctionItem[] = [{ id: '1', name: 'Found Item' } as unknown as AuctionItem];
            mockAuctionService.searchAuctionItems.mockResolvedValue(foundItems);

            const result = await controller.search('query');
            expect(result).toEqual(foundItems);
            expect(service.searchAuctionItems).toHaveBeenCalledWith('query');
            expect(service.searchAuctionItems).toHaveBeenCalledTimes(1);
        });
    });

    describe('findById', () => {
        it('should return an auction item by id', async () => {
            const item: AuctionItem = { id: '123', name: 'Item123' } as unknown as AuctionItem;
            mockAuctionService.findAuctionItemById.mockResolvedValue(item);

            const result = await controller.findById('123');
            expect(result).toEqual(item);
            expect(service.findAuctionItemById).toHaveBeenCalledWith('123');
            expect(service.findAuctionItemById).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException if item was not found', async () => {
            mockAuctionService.findAuctionItemById.mockResolvedValue(null);

            await expect(controller.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
        });
    });
});
