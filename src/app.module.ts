import { Module } from '@nestjs/common';
import { TripsModule } from '@trips/interface/trips.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // Global configuration module to load environment variables
    ConfigModule.forRoot({ isGlobal: true }),

    // MongoDB connection module
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    TripsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
