import { Module } from '@nestjs/common';
import { ServiceModule } from './core/services/service.module';
import { ConfigModule } from '@nestjs/config';
import { ControllerModule } from './http/controllers/controller.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports:
    [
      ConfigModule.forRoot({ isGlobal: true }),
      PersistenceModule,
      ServiceModule,
      ControllerModule,
    ],
})
export class AppModule { }
