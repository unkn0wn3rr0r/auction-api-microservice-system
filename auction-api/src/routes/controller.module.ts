import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { ImportController } from './csv-import.controller';
import { ServiceModule } from 'src/services/service.module';

@Module({
    imports: [ServiceModule],
    controllers: [AuctionController, ImportController],
})
export class ControllerModule { }
