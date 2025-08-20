import { SaveTripService } from './save-trip.service';
import { TripRepository } from '@trips/infrastructure/persistence/trip.repository';
import { Trip } from '@trips/domain/entities/trip.entity';

describe('SaveTripService', () => {
  let repo: jest.Mocked<TripRepository>;
  let service: SaveTripService;

  beforeEach(() => {
    repo = {
      save: jest.fn(),
    } as unknown as jest.Mocked<TripRepository>;
    service = new SaveTripService(repo);
  });

  it('should call repo.save with the provided trip and return the result', async () => {
    const trip: Trip = {
      id: '1',
      origin: 'Origin 1',
      destination: 'Destination 1',
      cost: 100,
      duration: 60,
      type: '',
      displayName: '',
    } as Trip;
    const savedTrip: Trip = {
      id: '1',
      origin: 'Origin 1',
      destination: 'Destination 1',
      cost: 100,
      duration: 60,
      type: '',
      displayName: '',
    } as Trip;
    repo.save.mockResolvedValue(savedTrip);

    const result = await service.execute(trip);

    expect(repo.save).toHaveBeenCalledWith(trip);
    expect(result).toBe(savedTrip);
  });

  it('should propagate errors from repo.save', async () => {
    const trip: Trip = {
      id: '2',
      origin: 'Origin 2',
      destination: 'Destination 2',
      cost: 200,
      duration: 120,
      type: '',
      displayName: '',
    } as Trip;
    const error = new Error('Save failed');
    repo.save.mockRejectedValue(error);

    await expect(service.execute(trip)).rejects.toThrow('Save failed');
    expect(repo.save).toHaveBeenCalledWith(trip);
  });
});
