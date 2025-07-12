import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { AuctionService } from './auction.service';
import { CsvImportService } from './csv-import.service';

@Module({
  imports: [PersistenceModule],
  providers: [AuctionService, CsvImportService],
  exports: [AuctionService, CsvImportService],
})
export class ServiceModule { }
