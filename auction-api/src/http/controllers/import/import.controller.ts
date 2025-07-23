import {
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CsvImportService } from 'src/core/services/csv-import/csv-import.service';
import { readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { cwd } from 'process';
import { AuthGuard } from 'src/http/guards/auth.guards';

const readFileAsync = promisify(readFile);

/*
    TODO:
    
    The drawback of that approach is that, the names here are hardcoded, so if:
    - the folder is placed somewhere else - that breaks
    - the folder name is changes - that breaks
    - the csv data filename is changed - that breaks
    - the csv data is moved somewhere else or is remove that breaks

    Of course this would be a problem if we frequently change folder/file names.
*/
const CSV_RELATIVE_PATH = join(cwd(), 'files', 'auction_data.csv');

@Controller('/import')
export class ImportController {
    constructor(private readonly service: CsvImportService) { }

    @UseGuards(AuthGuard)
    @Post('/csv')
    async importCsv(): Promise<{ message: string; importedCount: number }> {
        try {
            const buff = await readFileAsync(CSV_RELATIVE_PATH);
            const importedCount = await this.service.importCsvData(buff);
            return { message: 'Data import complete', importedCount };
        } catch (error) {
            return { message: error.message, importedCount: 0 };
        }
    }
}
