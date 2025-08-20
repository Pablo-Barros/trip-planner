import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TripsController } from './trips.controller';
import { SearchTripsService } from '@trips/application/services/search-trips.service';
import { TripSortService } from '@trips/domain/services/trip-sort.service';
import { TripsApiClient } from '@trips/infrastructure/external/trips-api.client';
import { MongooseModule } from '@nestjs/mongoose';
import { TripSchema } from '@trips/infrastructure/persistence/trip.schema';
import { SaveTripService } from '@trips/application/services/save-trip.service';
import { ListTripsService } from '@trips/application/services/list-trip.service';
import { DeleteTripService } from '@trips/application/services/delete-trip.service';
import { TripRepository } from '@trips/infrastructure/persistence/trip.repository';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: 'Trip',
        schema: TripSchema,
      },
    ]),
  ],
  controllers: [TripsController],
  providers: [
    SearchTripsService,
    TripSortService,
    TripsApiClient,
    SaveTripService,
    ListTripsService,
    DeleteTripService,
    TripRepository,
  ],
})
export class TripsModule {}
