import {
  Controller,
  Get,
  Query,
  ValidationPipe,
  Post,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchTripsService } from '@trips/application/services/search-trips.service';
import { SearchTripDto } from '@trips/application/dto/search-trip.dto';
import { CreateTripDto } from '@trips/application/dto/create-trip.dto';
import { SaveTripService } from '@trips/application/services/save-trip.service';
import { ListTripsService } from '@trips/application/services/list-trip.service';
import { DeleteTripService } from '@trips/application/services/delete-trip.service';

import { Trip } from '@trips/domain/entities/trip.entity';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(
    private readonly searchTripsService: SearchTripsService,
    private readonly saveTripService: SaveTripService,
    private readonly listTripsService: ListTripsService,
    private readonly deleteTripService: DeleteTripService,
  ) {}

  /**
   * Endpoint to search for trips based on origin, destination, and sorting strategy.
   * @param query - The search parameters including origin, destination, and sortBy.
   * @returns A promise that resolves to an array of sorted trips.
   */
  @Get('search')
  search(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: SearchTripDto,
  ): ReturnType<SearchTripsService['execute']> {
    return this.searchTripsService.execute(query);
  }

  /**
   * Endpoint to create a new trip.
   * @param dto - The trip data transfer object containing trip details.
   * @returns A promise that resolves to the created trip.
   */
  @Post()
  save(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateTripDto,
  ): Promise<Trip> {
    const trip = new Trip(
      undefined, // ID will be assigned by MongoDB
      dto.origin,
      dto.destination,
      dto.cost,
      dto.duration,
      dto.type,
      dto.displayName,
      dto.tripId, // Business identifier
    );
    return this.saveTripService.execute(trip);
  }

  /**
   * Endpoint to list all trips.
   * @returns A promise that resolves to an array of trips.
   */
  @Get()
  list(): Promise<Trip[]> {
    return this.listTripsService.execute();
  }

  /**
   * Endpoint to delete a trip by ID.
   * @param id - The ID of the trip to delete.
   * @returns A promise that resolves when the trip is deleted.
   */
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.deleteTripService.execute(id);
  }
}
