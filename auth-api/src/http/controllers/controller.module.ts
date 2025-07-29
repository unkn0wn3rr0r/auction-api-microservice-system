import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/core/services/service.module';
import { AuthController } from './auth/auth.controller';
import { MonitorController } from './monitor/monitor.controller';

@Module({
    imports: [ServiceModule],
    controllers: [
        AuthController,
        MonitorController,
    ],
})
export class ControllerModule { }
