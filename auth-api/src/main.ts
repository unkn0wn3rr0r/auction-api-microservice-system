import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  console.log(`auth-api listening on: ${await app.getUrl()}/auth`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(-1);
});
