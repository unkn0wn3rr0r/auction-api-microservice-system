import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { CsvImportService } from 'src/core/services/csv-import/csv-import.service';
import { readFile } from 'fs/promises';
import { AuthTransportationService } from 'src/core/services/transport/auth.transportation.service';
import { HttpModule } from '@nestjs/axios';

jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
}));

describe('ImportController', () => {
    let controller: ImportController;
    let csvImportService: CsvImportService;

    const mockCsvImportService = {
        importCsvData: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HttpModule], // need this for the AuthGuard
            controllers: [ImportController],
            providers: [
                {
                    provide: CsvImportService,
                    useValue: mockCsvImportService,
                },
                AuthTransportationService,
            ],
        }).compile();

        controller = module.get(ImportController);
        csvImportService = module.get(CsvImportService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return success message and count when CSV is imported', async () => {
        const fakeBuffer = Buffer.from('fake csv content');
        (readFile as jest.Mock).mockResolvedValue(fakeBuffer);
        mockCsvImportService.importCsvData.mockResolvedValue(3);

        const result = await controller.importCsv();
        expect(result).toEqual({
            message: 'Data import complete',
            importedCount: 3,
        });
        expect(mockCsvImportService.importCsvData).toHaveBeenCalledWith(fakeBuffer);
        expect(mockCsvImportService.importCsvData).toHaveBeenCalledTimes(1);
    });

    it('should return error message when import fails', async () => {
        (readFile as jest.Mock).mockRejectedValue(new Error('File read failed'));

        const result = await controller.importCsv();
        expect(result).toEqual({
            message: 'File read failed',
            importedCount: 0,
        });
        expect(mockCsvImportService.importCsvData).toHaveBeenCalledTimes(0);
    });
});
