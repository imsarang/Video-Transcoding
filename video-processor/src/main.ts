import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json());
  app.use(bodyParser.text({ type: 'text/plain' }));
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
