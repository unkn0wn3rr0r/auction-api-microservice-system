import { Logger } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Db, Collection, InsertOneResult, ObjectId } from 'mongodb';
import { UserCredentials, UserCredentialsEntity } from 'src/utils/models/user';

describe('AuthRepository', () => {
    let mockDb: Partial<Db>;
    let mockCollection: Partial<Collection<UserCredentialsEntity>>;
    let repository: AuthRepository;

    const sampleUser: UserCredentials = {
        email: 'test@example.com',
        password: 'hashed-password',
    };

    const sampleUserEntity: UserCredentialsEntity = {
        ...sampleUser,
        _id: new ObjectId(),
    };

    beforeEach(() => {
        mockCollection = {
            findOne: jest.fn(),
            insertOne: jest.fn(),
        };

        mockDb = {
            collection: jest.fn().mockReturnValue(mockCollection),
        };

        repository = new AuthRepository(mockDb as Db);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findUserByEmail', () => {
        it('should return a user if exists', async () => {
            (mockCollection.findOne as jest.Mock).mockResolvedValue(sampleUserEntity);

            const result = await repository.findUserByEmail(sampleUser.email);
            expect(result).toEqual(sampleUserEntity);
            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: sampleUser.email });
            expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
        });

        it('should return null if user does not exist', async () => {
            (mockCollection.findOne as jest.Mock).mockResolvedValue(null);

            const result = await repository.findUserByEmail('notfound@example.com');
            expect(result).toBeNull();
            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'notfound@example.com' });
            expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
        });
    });

    describe('createUserCredentials', () => {
        let errorSpy: jest.SpyInstance;

        beforeEach(() => {
            errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
        });

        it('should insert user and succeed if acknowledged', async () => {
            (mockCollection.insertOne as jest.Mock).mockResolvedValue({
                acknowledged: true,
                insertedId: new ObjectId(),
            } as InsertOneResult<UserCredentialsEntity>);

            await expect(repository.createUserCredentials(sampleUser)).resolves.toBeUndefined();

            expect(mockCollection.insertOne).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: sampleUser.email,
                    password: sampleUser.password,
                    _id: expect.any(ObjectId),
                }),
            );
            expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledTimes(0);
        });

        it('should throw error if insert is not acknowledged', async () => {
            (mockCollection.insertOne as jest.Mock).mockResolvedValue({
                acknowledged: false,
            } as InsertOneResult<UserCredentialsEntity>);

            await expect(repository.createUserCredentials(sampleUser)).rejects.toThrow(`Failed to create user credentials for ${sampleUser.email}`);
            expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(`Failed to create user credentials for ${sampleUser.email}`));
            expect(errorSpy).toHaveBeenCalledTimes(1);
        });

        it('should log and rethrow errors', async () => {
            (mockCollection.insertOne as jest.Mock).mockRejectedValue(new Error('DB error'));

            await expect(repository.createUserCredentials(sampleUser)).rejects.toThrow('DB error');
            expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
            expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(`Failed to create user credentials for ${sampleUser.email}: DB error`));
            expect(errorSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('userExists', () => {
        it('should return true if user exists', async () => {
            (mockCollection.findOne as jest.Mock).mockResolvedValue(sampleUserEntity);

            const result = await repository.userExists(sampleUser.email);
            expect(result).toBe(true);
            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: sampleUser.email });
            expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
        });

        it('should return false if user does not exist', async () => {
            (mockCollection.findOne as jest.Mock).mockResolvedValue(null);

            const result = await repository.userExists(sampleUser.email);
            expect(result).toBe(false);
            expect(mockCollection.findOne).toHaveBeenCalledWith({ email: sampleUser.email });
            expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
        });
    });
});
