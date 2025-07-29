import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('auction');
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
  console.log(`auction-api listening on: ${await app.getUrl()}/auction`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(-1);
});
