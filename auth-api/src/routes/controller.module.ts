import { Module } from '@nestjs/common';
import { ServiceModule } from 'src/services/service.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [ServiceModule],
    controllers: [AuthController],
})
export class ControllerModule { }
