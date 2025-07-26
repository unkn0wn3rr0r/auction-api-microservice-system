import {
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CsvImportService } from 'src/core/services/csv-import/csv-import.service';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { AuthGuard } from 'src/http/guards/auth.guards';

const CSV_RELATIVE_PATH = join(cwd(), 'files', 'auction_data.csv');

@Controller('/import')
export class ImportController {
    constructor(private readonly service: CsvImportService) { }

    @UseGuards(AuthGuard)
    @Post('/csv')
    async importCsv(): Promise<{ message: string; importedCount: number }> {
        try {
            const buff = await readFile(CSV_RELATIVE_PATH);
            const importedCount = await this.service.importCsvData(buff);
            return { message: 'Data import complete', importedCount };
        } catch (error) {
            return { message: error.message, importedCount: 0 };
        }
    }
}
