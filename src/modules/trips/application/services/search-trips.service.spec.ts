import { BadRequestException } from '@nestjs/common';
import { SearchTripsService } from './search-trips.service';
import { TripSortService } from '@trips/domain/services/trip-sort.service';
import { TripsApiClient } from '@trips/infrastructure/external/trips-api.client';
import { Trip } from '@trips/domain/entities/trip.entity';

describe('SearchTripsService', () => {
  let tripsApiClient: jest.Mocked<TripsApiClient>;
  let tripSortService: jest.Mocked<TripSortService>;
  let service: SearchTripsService;

  beforeEach(() => {
    tripsApiClient = {
      fetchTrips: jest.fn(),
    } as any;

    tripSortService = {
      sort: jest.fn(),
    } as any;

    service = new SearchTripsService(tripsApiClient, tripSortService);
  });

  it('should throw BadRequestException if origin is missing', async () => {
    await expect(
      service.execute({ origin: '', destination: 'Rome', sortBy: 'fastest' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if destination is missing', async () => {
    await expect(
      service.execute({
        origin: 'Milan',
        destination: '   ',
        sortBy: 'cheapest',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should call fetchTrips with trimmed origin and destination', async () => {
    tripsApiClient.fetchTrips.mockResolvedValue([]);
    tripSortService.sort.mockReturnValue([]);

    await service.execute({
      origin: '  Milan ',
      destination: ' Rome ',
      sortBy: 'fastest',
    });

    expect(tripsApiClient.fetchTrips).toHaveBeenCalledWith('Milan', 'Rome');
  });

  it('should throw error if tripsApiClient returns non-array', async () => {
    tripsApiClient.fetchTrips.mockResolvedValue(null as any);

    await expect(
      service.execute({
        origin: 'Milan',
        destination: 'Rome',
        sortBy: 'cheapest',
      }),
    ).rejects.toThrow('Trips API returned an invalid response');
  });

  it('should sort trips using tripSortService', async () => {
    const trips: Trip[] = [{ id: '1' } as Trip, { id: '2' } as Trip];
    const sortedTrips: Trip[] = [{ id: '2' } as Trip, { id: '1' } as Trip];

    tripsApiClient.fetchTrips.mockResolvedValue(trips);
    tripSortService.sort.mockReturnValue(sortedTrips);

    const result = await service.execute({
      origin: 'Milan',
      destination: 'Rome',
      sortBy: 'cheapest',
    });

    expect(tripSortService.sort).toHaveBeenCalledWith(trips, 'cheapest');
    expect(result).toBe(sortedTrips);
  });
});
