import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Trip } from '../../domain/entities/trip.entity';

// Types for the external trips API
interface ExternalTripData {
  id: string;
  origin: string;
  destination: string;
  cost: number;
  duration: number;
  type: string;
  display_name: string;
}

// The API response can be an array of trips or other unexpected formats
type ExternalTripsApiResponse = ExternalTripData[] | null;

@Injectable()
export class TripsApiClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiUrl = this.config.get<string>('TRIPS_API_URL')!;
    this.apiKey = this.config.get<string>('TRIPS_API_KEY')!;

    // Basic validation
    if (!this.apiUrl)
      throw new Error('Missing required configuration: TRIPS_API_URL');
    if (!this.apiKey)
      throw new Error('Missing required configuration: TRIPS_API_KEY');
  }

  /**
   * Fetches trips from the external API based on origin and destination.
   * @param origin - The starting point for the trip search.
   * @param destination - The endpoint for the trip search.
   * @returns A promise that resolves to an array of Trip entities.
   */
  async fetchTrips(origin: string, destination: string): Promise<Trip[]> {
    const { data } = await firstValueFrom(
      this.http.get<ExternalTripsApiResponse>(this.apiUrl, {
        headers: { 'x-api-key': this.apiKey },
        params: { origin, destination },
      }),
    );

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((rawTrip: ExternalTripData) => this.createTrip(rawTrip));
  }

  private createTrip(raw: ExternalTripData): Trip {
    return new Trip(
      raw.id,
      raw.origin,
      raw.destination,
      raw.cost,
      raw.duration,
      raw.type,
      raw.display_name,
    );
  }
}
