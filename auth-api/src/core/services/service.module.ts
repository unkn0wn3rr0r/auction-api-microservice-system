import { Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { JWT_SECRET_EXPIRATION_NAME, JWT_SECRET_NAME } from 'src/utils/constants';
import { AuthRepository } from 'src/persistence/repositories/auth/auth.repository';
import { MonitorService } from './monitor/monitor.service';

@Module({
  imports: [
    ConfigModule,
    PersistenceModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
        secret: configService.get<string>(JWT_SECRET_NAME),
        signOptions: {
          expiresIn: configService.get<string>(JWT_SECRET_EXPIRATION_NAME),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthRepository,
    MonitorService,
  ],
  exports: [
    AuthService,
    MonitorService,
  ],
})
export class ServiceModule { }
