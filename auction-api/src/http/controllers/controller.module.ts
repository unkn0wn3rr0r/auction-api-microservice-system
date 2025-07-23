import { Module } from '@nestjs/common';
import { AuctionController } from './auction/auction.controller';
import { ImportController } from './import/import.controller';
import { ServiceModule } from 'src/core/services/service.module';
import { MonitorController } from './monitor/monitor.controller';

@Module({
    imports: [ServiceModule],
    controllers: [
        AuctionController,
        ImportController,
        MonitorController,
    ],
})
export class ControllerModule { }
