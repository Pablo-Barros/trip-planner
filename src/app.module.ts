import { Module } from '@nestjs/common';
import { TripsModule } from './modules/trips/interface/trips.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TripsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
