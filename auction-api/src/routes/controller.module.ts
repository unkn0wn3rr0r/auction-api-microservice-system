import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { ImportController } from './csv-import.controller';
import { ServiceModule } from 'src/services/service.module';
import { MonitorController } from './monitor.controller';

@Module({
    imports: [ServiceModule],
    controllers: [AuctionController, ImportController, MonitorController],
})
export class ControllerModule { }
