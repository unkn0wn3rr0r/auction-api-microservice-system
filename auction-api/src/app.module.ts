import { Module } from '@nestjs/common';
import { PersistenceModule } from './persistence/persistence.module';
import { ServiceModule } from './services/service.module';
import { ControllerModule } from './routes/controller.module';

@Module({
  imports: [
    PersistenceModule,
    ServiceModule,
    ControllerModule,
  ],
})
export class AppModule { }
