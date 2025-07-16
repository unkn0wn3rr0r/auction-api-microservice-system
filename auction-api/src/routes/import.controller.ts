import {
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CsvImportService } from 'src/services/csv-import.service';
import { readFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { cwd } from 'process';
import { AuthGuard } from 'src/guards/auth.guards';

const readFileAsync = promisify(readFile);

/*
    The drawback of that approach is that, the names here are hardcoded, so if:
    - the folder is placed somewhere else - that breaks
    - the folder name is changes - that breaks
    - the csv data filename is changed - that breaks
    - the csv data is moved somewhere else or is remove that breaks

    Of course this would be a problem if we frequently change folder/file names.
*/
const CSV_RELATIVE_PATH = join(cwd(), 'files', 'auction_data.csv');

/*
    I will try to explain my idea about this route in short.

    First of all the idea of that route is to have different endpoints with which you can upload different type of files - csv, txt, etc.
    I think as a design it's better to be a separate controller from the auction one, with a separate service as well.

    I have spent 3-4 hours trying to use @UploadedFiles and @UseInterceptors(FileInterceptor...) decorators,
    so this can work as an API endpoint with which the user can attach and upload the file with Postman, etc.
    But the FileInterceptor was always giving me an undefined value and I don't really know what the problem is and decided
    to move on with a simpler implementation.

    Now the drawback with this approach and that /import/csv route is that the user can spam infinitely the db with data.
*/
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
