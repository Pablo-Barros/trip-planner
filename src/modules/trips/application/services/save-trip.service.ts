import { Injectable } from '@nestjs/common';
import { Trip } from '@trips/domain/entities/trip.entity';
import { TripRepository } from '@trips/infrastructure/persistence/trip.repository';

@Injectable()
export class SaveTripService {
  constructor(private readonly repo: TripRepository) {}

  execute(trip: Trip): Promise<Trip> {
    return this.repo.save(trip);
  }
}
