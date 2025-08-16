import { TripSortService } from './trip-sort.service';
import { Trip } from '../entities/trip.entity';

describe('TripSortService', () => {
  let service: TripSortService;
  let trips: Trip[];

  beforeEach(() => {
    service = new TripSortService();
    trips = [
      new Trip('1', 'SYD', 'GRU', 500, 10, 'flight', 'Trip 1'),
      new Trip('2', 'SYD', 'GRU', 300, 15, 'flight', 'Trip 2'),
    ];
  });

  it('should sort by fastest', () => {
    const result = service.sort(trips, 'fastest');
    expect(result[0].duration).toBe(10);
  });

  it('should sort by cheapest', () => {
    const result = service.sort(trips, 'cheapest');
    expect(result[0].cost).toBe(300);
  });

  it('should not mutate original array', () => {
    const original = [...trips];
    service.sort(trips, 'fastest');
    expect(trips).toEqual(original);
  });
});
