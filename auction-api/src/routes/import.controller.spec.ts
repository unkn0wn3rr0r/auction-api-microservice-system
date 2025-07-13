import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { CsvImportService } from 'src/services/csv-import.service';
import { readFile } from 'fs';
import { promisify } from 'util';

jest.mock('fs', () => ({
    readFile: jest.fn(),
}));
const mockReadFileAsync = promisify(readFile) as jest.Mock;

describe('ImportController', () => {
    let controller: ImportController;
    let csvImportService: CsvImportService;

    const mockCsvImportService = {
        importCsvData: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ImportController],
            providers: [
                {
                    provide: CsvImportService,
                    useValue: mockCsvImportService,
                },
            ],
        }).compile();

        controller = module.get<ImportController>(ImportController);
        csvImportService = module.get<CsvImportService>(CsvImportService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return success message and count when CSV is imported', async () => {
        const fakeBuffer = Buffer.from('fake csv content');
        mockReadFileAsync.mockImplementation((_, callback) => {
            callback(null, fakeBuffer);
        });
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
        mockReadFileAsync.mockImplementation((_, callback) => {
            callback(new Error('File read failed'), null);
        });

        const result = await controller.importCsv();

        expect(result).toEqual({
            message: 'File read failed',
            importedCount: 0,
        });
        expect(mockCsvImportService.importCsvData).toHaveBeenCalledTimes(0);
    });
});
