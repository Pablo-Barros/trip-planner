import { Trip } from '../entities/trip.entity';

export type TripSortStrategy = 'fastest' | 'cheapest';

export class TripSortService {
  /**
   * Predefined comparators for sorting trips.
   * TypeScript ensures that this object has ALL required strategies.
   */
  private static readonly comparators: Record<
    TripSortStrategy,
    (a: Trip, b: Trip) => number
  > = {
    fastest: (a, b) => a.duration - b.duration,
    cheapest: (a, b) => a.cost - b.cost,
  } as const;

  /**
   * Sorts an array of trips using the specified strategy.
   * @param trips - The array of trips to sort.
   * @param strategy - The sorting strategy to use.
   * @returns A new array of trips sorted according to the specified strategy.
   */
  sort(trips: Trip[], strategy: TripSortStrategy): Trip[] {
    return [...trips].sort(TripSortService.comparators[strategy]);
  }
}
