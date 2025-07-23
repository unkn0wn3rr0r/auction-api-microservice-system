import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { AuctionService } from './auction/auction.service';
import { CsvImportService } from './csv-import/csv-import.service';
import { MonitorService } from './monitor/monitor.service';
import { AuthTransportationService } from './transport/auth.transportation.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PersistenceModule,
  ],
  providers: [
    AuctionService,
    CsvImportService,
    MonitorService,
    AuthTransportationService,
  ],
  exports: [
    AuctionService,
    CsvImportService,
    MonitorService,
    AuthTransportationService,
  ],
})
export class ServiceModule { }
