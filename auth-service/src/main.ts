import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3002;
  try {
    await app.listen(port);
    // Helpful startup log
    // Nest already logs some info, but this is explicit and clearer for quick debugging
    // (especially when using env vars)
    // eslint-disable-next-line no-console
    console.log(`Auth service listening on port ${port}`);
  } catch (err: any) {
    // Make EADDRINUSE easier to understand for developers
    if (err && err.code === 'EADDRINUSE') {
      // eslint-disable-next-line no-console
      console.error(`Port ${port} is already in use. Free the port or set PORT to a different value.`);
      process.exit(1);
    }
    throw err;
  }
}
bootstrap();
