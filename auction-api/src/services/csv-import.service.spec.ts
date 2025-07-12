import { CsvImportService } from './csv-import.service';
import { AuctionRepository } from 'src/persistence/auction.repository';
import { Logger } from '@nestjs/common';

describe('CsvImportService', () => {
    let mockRepo: Partial<Record<keyof AuctionRepository, jest.Mock>>;
    let service: CsvImportService;

    beforeEach(() => {
        mockRepo = {
            insertCsvData: jest.fn(),
        };

        service = new CsvImportService(mockRepo as unknown as AuctionRepository);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    });

    it('should parse valid CSV data and insert it', async () => {
        const csvContent = `title,description,category,price,status
Test Title,Test Description,Electronics,150,active
Second Item,Another Desc,Toys,90,inactive`;

        const buffer = Buffer.from(csvContent);

        const insertedCount = await service.importCsvData(buffer);

        expect(insertedCount).toBe(2);
        expect(mockRepo.insertCsvData).toHaveBeenCalledTimes(1);
        expect(mockRepo.insertCsvData).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    title: 'Test Title',
                    estimated_value: 150,
                    status: 'active',
                }),
            ])
        );
    });

    it('should skip invalid rows and only insert valid ones', async () => {
        const csvContent = `title,description,category,price,status
,,,,
Valid Title,Valid Desc,Books,50,active`;

        const buffer = Buffer.from(csvContent);

        const insertedCount = await service.importCsvData(buffer);

        expect(insertedCount).toBe(1);
        expect(mockRepo.insertCsvData).toHaveBeenCalledTimes(1);
        expect(Logger.prototype.warn).toHaveBeenCalledWith('Skipped potential invalid CSV row '); // for invalid row
    });

    it('should not insert if all rows are invalid', async () => {
        const csvContent = `title,description,category,price,status
,,,,`;

        const buffer = Buffer.from(csvContent);

        const insertedCount = await service.importCsvData(buffer);

        expect(insertedCount).toBe(0);
        expect(mockRepo.insertCsvData).toHaveBeenCalledTimes(0);
    });

    it('should handle repository insertion error', async () => {
        const csvContent = `title,description,category,price,status
Test Item,Desc,Cat,100,active`;
        const buffer = Buffer.from(csvContent);

        mockRepo.insertCsvData!.mockRejectedValue(new Error('Insert failed'));

        await expect(service.importCsvData(buffer)).rejects.toThrow('Insert failed');

        expect(Logger.prototype.error).toHaveBeenCalledWith(
            expect.stringContaining('Got error while inserting CSV data: Insert failed'),
        );
    });
});
