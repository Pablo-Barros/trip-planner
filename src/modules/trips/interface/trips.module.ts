import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TripsController } from './trips.controller';
import { SearchTripsService } from '../application/services/search-trips.service';
import { TripSortService } from '../domain/services/trip-sort.service';
import { TripsApiClient } from '../infrastructure/external/trips-api.client';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TripsController],
  providers: [SearchTripsService, TripSortService, TripsApiClient],
})
export class TripsModule {}
