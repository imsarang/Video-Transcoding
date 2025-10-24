import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT as string) || 5432,
                username: process.env.DB_USERNAME || 'myself',
                password: process.env.DB_PASSWORD || 'mypassword',
                database: process.env.DB_NAME || 'userdb',
                autoLoadEntities: true,
                synchronize: true, // Note: set to false in production
                logging: true,
                logger: 'advanced-console'
            })
        })
    ]
})
export class DatabaseModule {}