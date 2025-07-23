import { Logger } from '@nestjs/common';

import { Collection, Db, InsertOneResult, ObjectId } from 'mongodb';
import { AuctionItem, AuctionRepository } from 'src/utils/models/auction';
import { MongoAuctionRepository } from './mongo.auction.repository';

describe('AuctionRepository', () => {
    let repository: AuctionRepository;
    let mockDb: Partial<Db>;
    let mockCollection: Partial<Collection<AuctionItem>>;
    let mockLogger: Partial<Logger>;

    const mockAuctionItem = {
        _id: new ObjectId(),
        title: 'Test Item',
        description: 'Test Description',
        estimated_value: 100,
    } as AuctionItem;

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
            find: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                toArray: jest.fn(),
            }),
            insertOne: jest.fn(),
            insertMany: jest.fn(),
        };

        mockDb = {
            collection: jest.fn().mockReturnValue(mockCollection),
            command: jest.fn(),
        };

        mockLogger = {
            warn: jest.fn(),
            error: jest.fn(),
        };

        repository = new MongoAuctionRepository(mockDb as Db);

        Reflect.set(repository, 'logger', mockLogger); // that's a small trick i like to use, set the logger without changing the property from public to private
    });

    it('should find an auction item by ID', async () => {
        (mockCollection.findOne as jest.Mock).mockResolvedValue(mockAuctionItem);

        const result = await repository.findAuctionItemById(mockAuctionItem._id!.toHexString());

        expect(result).toEqual(mockAuctionItem);
        expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(mockAuctionItem._id) });
        expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return all auction items', async () => {
        const items = [mockAuctionItem];
        ((mockCollection.find as any)().toArray as jest.Mock).mockResolvedValue(items);

        const result = await repository.findAllAuctionItems();

        expect(result).toEqual(items);
        expect(mockCollection.find).toHaveBeenCalledTimes(2); // expect two times, because of how i mock on line 48
    });

    it('should create an auction item', async () => {
        const insertResult: InsertOneResult<AuctionItem> = {
            acknowledged: true,
            insertedId: new ObjectId(),
        };
        (mockCollection.insertOne as jest.Mock).mockResolvedValue(insertResult);

        const itemToCreate = { ...mockAuctionItem };
        delete itemToCreate._id;

        const result = await repository.createAuctionItem(itemToCreate);

        expect(result._id).toEqual(insertResult.insertedId);
        expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if createAuctionItem fails', async () => {
        (mockCollection.insertOne as jest.Mock).mockResolvedValue({ acknowledged: false });

        await expect(
            repository.createAuctionItem(mockAuctionItem)
        ).rejects.toThrow(`Creating auction item - ${mockAuctionItem.title} failed`);
    });

    it('should search auction items by query', async () => {
        const items = [mockAuctionItem];
        ((mockCollection.find as jest.Mock).mockReturnValueOnce({
            toArray: jest.fn().mockResolvedValue(items),
        }));

        const result = await repository.searchAuctionItems('Test');

        expect(result).toEqual(items);
        expect(mockCollection.find).toHaveBeenCalledTimes(1);
        expect(mockCollection.find).toHaveBeenCalledWith({
            $or: [
                { title: { $regex: 'Test', $options: 'i' } },
                { description: { $regex: 'Test', $options: 'i' } },
            ],
        });
    });

    describe('insertCsvData', () => {
        const mockAuctionItems = [mockAuctionItem, { ...mockAuctionItem, id: '2' }];

        it('should insert CSV data successfully', async () => {
            (mockCollection.insertMany as jest.Mock).mockResolvedValue({
                acknowledged: true,
                insertedCount: mockAuctionItems.length,
            });

            await expect(repository.insertCsvData(mockAuctionItems)).resolves.not.toThrow();

            expect(mockCollection.insertMany).toHaveBeenCalledWith(mockAuctionItems);
            expect(mockCollection.insertMany).toHaveBeenCalledTimes(1);
            expect(mockLogger.warn).toHaveBeenCalledTimes(0);
        });

        it('should throw an error when insertion is not acknowledged', async () => {
            (mockCollection.insertMany as jest.Mock).mockResolvedValue({
                acknowledged: false,
                insertedCount: 0,
            });

            await expect(repository.insertCsvData(mockAuctionItems)).rejects.toThrow('Inserting CSV data failed');
            expect(mockCollection.insertMany).toHaveBeenCalledTimes(1);
            expect(mockLogger.warn).toHaveBeenCalledTimes(0);
        });

        it('should log warning when insertedCount does not match items length', async () => {
            (mockCollection.insertMany as jest.Mock).mockResolvedValue({
                acknowledged: true,
                insertedCount: 1, // only 1 item inserted out of 2
            });

            await repository.insertCsvData(mockAuctionItems);

            expect(mockCollection.insertMany).toHaveBeenCalledTimes(1);
            expect(mockLogger.warn).toHaveBeenCalledWith(`There was a mismatch while inserting CSV data - 1 out of ${mockAuctionItems.length} items`);
            expect(mockLogger.warn).toHaveBeenCalledTimes(1);
        });
    });

    it('should return true when db is healthy', async () => {
        (mockDb.command as jest.Mock).mockResolvedValue({ ok: 1 });

        const result = await repository.isHealthy();

        expect(result).toBe(true);
        expect(mockDb.command).toHaveBeenCalledWith({ ping: 1 });
        expect(mockDb.command).toHaveBeenCalledTimes(1);
        expect(mockLogger.error).toHaveBeenCalledTimes(0);
    });

    it('should return false when db is unhealthy', async () => {
        (mockDb.command as jest.Mock).mockRejectedValue(new Error('Connection failed'));

        const result = await repository.isHealthy();

        expect(result).toBe(false);
        expect(mockDb.command).toHaveBeenCalledTimes(1);
        expect(mockLogger.error).toHaveBeenCalledWith('Health check failed: Connection failed');
        expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });
});
