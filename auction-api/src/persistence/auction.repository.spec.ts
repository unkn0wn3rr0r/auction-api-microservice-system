import { AuctionRepository } from './auction.repository';
import { Collection, Db, InsertOneResult, ObjectId } from 'mongodb';
import { AuctionItem } from 'src/models/auction-item';

describe('AuctionRepository', () => {
    let repository: AuctionRepository;
    let mockDb: Partial<Db>;
    let mockCollection: Partial<Collection<AuctionItem>>;

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
        };

        repository = new AuctionRepository(mockDb as Db);
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

    it('should throw if createAuctionItem fails', async () => {
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

    it('should insert CSV data', async () => {
        await repository.insertCsvData([mockAuctionItem]);

        expect(mockCollection.insertMany).toHaveBeenCalledWith([mockAuctionItem]);
        expect(mockCollection.insertMany).toHaveBeenCalledTimes(1);
    });
});
