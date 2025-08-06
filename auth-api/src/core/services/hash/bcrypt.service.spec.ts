import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('BcryptService', () => {
    let service: BcryptService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BcryptService],
        }).compile();

        service = module.get(BcryptService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('hash', () => {
        it('should generate a hash using bcrypt', async () => {
            const data = 'test-password';
            const salt = 'test-salt';
            const hashed = 'hashed-password';

            (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashed);

            const result = await service.hash(data);

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
            expect(bcrypt.hash).toHaveBeenCalledWith(data, salt);
            expect(bcrypt.hash).toHaveBeenCalledTimes(1);
            expect(result).toBe(hashed);
        });
    });

    describe('compare', () => {
        it('should return true if data matches the hash', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.compare('input', 'hashed-value');

            expect(bcrypt.compare).toHaveBeenCalledWith('input', 'hashed-value');
            expect(bcrypt.compare).toHaveBeenCalledTimes(1);
            expect(result).toBe(true);
        });

        it('should return false if data does not match the hash', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.compare('wrong-input', 'hashed-value');

            expect(bcrypt.compare).toHaveBeenCalledWith('wrong-input', 'hashed-value');
            expect(bcrypt.compare).toHaveBeenCalledTimes(1);
            expect(result).toBe(false);
        });
    });
});
