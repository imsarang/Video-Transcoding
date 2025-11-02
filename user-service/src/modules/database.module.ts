import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: 'postgres',
                host: process.env.POSTGRES_HOST || 'localhost',
                port: parseInt(process.env.POSTGRES_PORT as string) || 5432,
                username: process.env.POSTGRES_USER || 'myusername',
                password: process.env.POSTGRES_PASSWORD || 'mypassword',
                database: process.env.POSTGRES_DB || 'postgres',
                autoLoadEntities: true,
                synchronize: true, // Note: set to false in production
                logging: true,
                logger: 'advanced-console'
            })
        })
    ]
})
export class DatabaseModule implements OnModuleInit{
    async onModuleInit() {
        console.log(`Inside database module init`);
        
    }
}