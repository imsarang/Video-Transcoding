// Polyfill a web-style `crypto` on globalThis for Node versions that don't expose it
// (e.g., Node 18). Some libraries (TypeORM/Nest internals) call `crypto.randomUUID()`
// during module initialization. This must run before importing application modules.
if (!(globalThis as any).crypto) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    (globalThis as any).crypto = require('crypto');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to polyfill global.crypto:', err);
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerInterceptor } from './common/logging.interceptor';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new LoggerInterceptor(app.get(Logger)),
  );

  const port = process.env.PORT ?? 3003;
  try {
    await app.listen(port);
    // Helpful startup log
    // Nest already logs some info, but this is explicit and clearer for quick debugging
    // (especially when using env vars)
    // eslint-disable-next-line no-console
    console.log(`User service listening on port ${port}`);
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
