import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { CsvImportController } from './csv-import.controller';
import { ServiceModule } from 'src/services/service.module';

@Module({
    imports: [ServiceModule],
    controllers: [AuctionController, CsvImportController],
})
export class ControllerModule { }
