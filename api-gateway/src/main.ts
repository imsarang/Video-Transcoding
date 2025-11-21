import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalHttpExceptionFilter } from './interceptors/globalExceptionFilter.interceptor';
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true // enabled boot time logs
  });

  app.useLogger(app.get(Logger)) // use pino as Nest logger
  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(Logger)),
    new ResponseInterceptor()
  ); // apply logging interceptor globally

  app.useGlobalFilters(new GlobalHttpExceptionFilter())

  app.use(cookieParser())
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
