import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database.module';
import { DataDogLogger } from './modules/logger.module';

@Module({
  imports: [
    DatabaseModule, //Database module imported here
    DataDogLogger, // Datadog logs when deployed
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
