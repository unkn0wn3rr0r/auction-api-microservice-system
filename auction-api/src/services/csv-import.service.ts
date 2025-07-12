import { Injectable, Logger } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { AuctionItem, AuctionItemCsvFormat } from 'src/models/auction-item';
import { AuctionRepository } from 'src/persistence/auction.repository';

/*
  That service can be improved by not coupling the headers to that exact format of names.
  Also better validation and utilization of the library (csv-parser) can be done.
*/
@Injectable()
export class CsvImportService {
  private readonly logger = new Logger(CsvImportService.name);

  constructor(private readonly repository: AuctionRepository) { }

  async importCsvData(buffer: Buffer): Promise<number> {
    const stream = Readable.from(buffer);
    const items: AuctionItem[] = [];

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser({
          mapHeaders: ({ header }) => header.toLowerCase(),
        }))
        .on('data', (row: AuctionItemCsvFormat) => {
          try {
            if (!row.title || !row.description || !row.category || !row.price || !row.status) {
              this.logger.warn(`Skipped potential invalid CSV row ${row.title}`);
              return;
            }
            items.push({
              title: row.title,
              description: row.description,
              category: row.category,
              status: row.status,
              estimated_value: Number(row.price),
              created_at: new Date(),
            });
          } catch (err) {
            this.logger.error(`Got error while proccessing CSV row: ${err.message}`);
          }
        })
        .on('end', async () => {
          try {
            if (items.length) {
              await this.repository.insertCsvData(items);
            }
            this.logger.log(`CSV data was inserted successfully with total of ${items.length} items.`);
            resolve(items.length);
          } catch (err) {
            this.logger.error(`Got error while inserting CSV data: ${err.message}`);
            reject(err);
          }
        })
        .on('error', (err) => {
          this.logger.error(`Got error while processing CSV data: ${err.message}`);
          reject(err);
        });
    });
  }
}
