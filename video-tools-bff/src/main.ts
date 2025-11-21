import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { GlobalHttpExceptionFilter } from './common/interceptor/exceptionFilter.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3004;
  console.log(`Application is starting on port ${port}`);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
  )

  app.useGlobalFilters(
    new GlobalHttpExceptionFilter()
  )
}
bootstrap();
