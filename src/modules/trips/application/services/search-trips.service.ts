import { Injectable, BadRequestException } from '@nestjs/common';
import { TripSortService } from '../../domain/services/trip-sort.service';
import { TripsApiClient } from '../../infrastructure/external/trips-api.client';
import { Trip } from '../../domain/entities/trip.entity';

interface SearchTripsParams {
  origin: string;
  destination: string;
  sortBy: 'fastest' | 'cheapest';
}

@Injectable()
export class SearchTripsService {
  constructor(
    private readonly tripsApiClient: TripsApiClient,
    private readonly tripSortService: TripSortService,
  ) {}

  async execute(params: SearchTripsParams): Promise<Trip[]> {
    const { origin, destination, sortBy } = params;

    // input validation
    if (!origin?.trim() || !destination?.trim()) {
      throw new BadRequestException('Origin and destination are required');
    }

    // fetch trips from API
    const trips = await this.tripsApiClient.fetchTrips(
      origin.trim(),
      destination.trim(),
    );

    // validate API response
    if (!Array.isArray(trips)) {
      throw new Error('Trips API returned an invalid response');
    }

    return this.tripSortService.sort(trips, sortBy);
  }
}
