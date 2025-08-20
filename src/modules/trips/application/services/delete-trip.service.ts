import { Injectable, NotFoundException } from '@nestjs/common';
import { TripRepository } from '@trips/infrastructure/persistence/trip.repository';

@Injectable()
export class DeleteTripService {
  constructor(private readonly repo: TripRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repo.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Trip with id ${id} not found`);
    }
  }
}
