import { Injectable } from '@nestjs/common';
import { Trip } from '@trips/domain/entities/trip.entity';
import { TripRepository } from '@trips/infrastructure/persistence/trip.repository';

@Injectable()
export class ListTripsService {
  constructor(private readonly repo: TripRepository) {}

  execute(): Promise<Trip[]> {
    return this.repo.findAll();
  }
}
