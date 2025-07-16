import { mongoClientProvider } from './mongo-client';

const mockConnect = jest.fn();
const mockDb = jest.fn();

jest.mock('mongodb', () => {
    const mockDbInstance = { databaseName: 'authdb' };

    return {
        MongoClient: jest.fn().mockImplementation(() => ({
            connect: mockConnect,
            db: mockDb.mockReturnValue(mockDbInstance),
        })),
    };
});

describe('mongoClientProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to MongoDB and return the db instance', async () => {
        const dbInstance = await mongoClientProvider();

        expect(dbInstance).toBeDefined();
        expect(dbInstance.databaseName).toBe('authdb');
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(mockDb).toHaveBeenCalledWith('authdb');
        expect(mockDb).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if connection fails', async () => {
        mockConnect.mockRejectedValue(new Error('Connection failed'));

        await expect(mongoClientProvider()).rejects.toThrow('Connection failed');
    });
});
