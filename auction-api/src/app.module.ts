import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { ServiceModule } from './core/services/service.module';
import { ControllerModule } from './http/controllers/controller.module';

@Module({
  imports: [
    PersistenceModule,
    ServiceModule,
    ControllerModule,
  ],
})
export class AppModule { }
