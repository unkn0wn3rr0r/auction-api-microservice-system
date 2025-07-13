import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { AuctionService } from './auction.service';
import { CsvImportService } from './csv-import.service';
import { MonitorService } from './monitor.service';

@Module({
  imports: [PersistenceModule],
  providers: [AuctionService, CsvImportService, MonitorService],
  exports: [AuctionService, CsvImportService, MonitorService],
})
export class ServiceModule { }
