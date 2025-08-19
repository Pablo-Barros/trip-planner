import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TripsController } from './trips.controller';
import { SearchTripsService } from '@trips/application/services/search-trips.service';
import { TripSortService } from '@trips/domain/services/trip-sort.service';
import { TripsApiClient } from '@trips/infrastructure/external/trips-api.client';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TripsController],
  providers: [SearchTripsService, TripSortService, TripsApiClient],
})
export class TripsModule {}
