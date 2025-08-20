import { ListTripsService } from './list-trip.service';
import { TripRepository } from '@trips/infrastructure/persistence/trip.repository';
import { Trip } from '@trips/domain/entities/trip.entity';

describe('ListTripsService', () => {
  let service: ListTripsService;
  let mockRepo: jest.Mocked<TripRepository>;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
    } as unknown as jest.Mocked<TripRepository>;
    service = new ListTripsService(mockRepo);
  });

  it('should call repo.findAll and return trips', async () => {
    const trips: Trip[] = [
      {
        id: '1',
        origin: 'Origin 1',
        destination: 'Destination 1',
        cost: 100,
        duration: 60,
        type: '',
        displayName: '',
      },
      {
        id: '2',
        origin: 'Origin 2',
        destination: 'Destination 2',
        cost: 100,
        duration: 60,
        type: '',
        displayName: '',
      },
    ];
    mockRepo.findAll.mockResolvedValue(trips);

    const result = await service.execute();

    expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(trips);
  });

  it('should propagate errors from repo.findAll', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('DB error'));

    await expect(service.execute()).rejects.toThrow('DB error');
  });
});
