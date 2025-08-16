import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchTripsService } from '../application/services/search-trips.service';
import { SearchTripDto } from '../application/dto/search-trip.dto';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly searchTripsService: SearchTripsService) {}

  @Get('search')
  search(
    /**
     * Endpoint to search for trips based on origin, destination, and sorting strategy.
     * @param query - The search parameters including origin, destination, and sortBy.
     * @returns A promise that resolves to an array of sorted trips.
     */
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: SearchTripDto,
  ): ReturnType<SearchTripsService['execute']> {
    return this.searchTripsService.execute(query);
  }
}
