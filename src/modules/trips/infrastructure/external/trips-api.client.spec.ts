/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TripsApiClient } from './trips-api.client';
import { Trip } from '@trips/domain/entities/trip.entity';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('TripsApiClient', () => {
  let client: TripsApiClient;
  let httpService: jest.Mocked<HttpService>;

  const mockConfig: Record<string, string> = {
    TRIPS_API_URL: 'https://test-api.com/trips',
    TRIPS_API_KEY: 'test-api-key',
  };

  const mockTripData = {
    id: 'a749c866-7928-4d08-9d5c-a6821a583d1a',
    origin: 'SYD',
    destination: 'GRU',
    cost: 625,
    duration: 5,
    type: 'flight',
    display_name: 'from SYD to GRU by flight',
  };

  const createMockAxiosResponse = (data: unknown): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  });

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => mockConfig[key]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsApiClient,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    client = module.get<TripsApiClient>(TripsApiClient);
    httpService = module.get(HttpService);
  });

  describe('Constructor', () => {
    it('should initialize successfully with valid configuration', () => {
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(TripsApiClient);
    });

    it('should throw error when TRIPS_API_URL is missing', () => {
      const mockHttpService = { get: jest.fn() };
      const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'TRIPS_API_URL') return undefined;
          return mockConfig[key];
        }),
      };

      expect(() => {
        new TripsApiClient(mockHttpService as any, mockConfigService as any);
      }).toThrow('Missing required configuration: TRIPS_API_URL');
    });

    it('should throw error when TRIPS_API_KEY is missing', () => {
      const mockHttpService = { get: jest.fn() };
      const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'TRIPS_API_KEY') return undefined;
          return mockConfig[key];
        }),
      };

      expect(() => {
        new TripsApiClient(mockHttpService as any, mockConfigService as any);
      }).toThrow('Missing required configuration: TRIPS_API_KEY');
    });

    it('should throw error when both configuration values are missing', () => {
      const mockHttpService = { get: jest.fn() };
      const mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      expect(() => {
        new TripsApiClient(mockHttpService as any, mockConfigService as any);
      }).toThrow('Missing required configuration: TRIPS_API_URL');
    });
  });

  describe('fetchTrips', () => {
    it('should fetch and transform trips successfully', async () => {
      const mockResponse = createMockAxiosResponse([mockTripData]);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(httpService.get).toHaveBeenCalledWith(mockConfig.TRIPS_API_URL, {
        headers: { 'x-api-key': mockConfig.TRIPS_API_KEY },
        params: { origin: 'SYD', destination: 'GRU' },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Trip);
      expect(result[0].id).toBe(mockTripData.id);
      expect(result[0].origin).toBe(mockTripData.origin);
      expect(result[0].destination).toBe(mockTripData.destination);
      expect(result[0].cost).toBe(mockTripData.cost);
      expect(result[0].duration).toBe(mockTripData.duration);
      expect(result[0].type).toBe(mockTripData.type);
      expect(result[0].displayName).toBe(mockTripData.display_name);
    });

    it('should handle multiple trips in response', async () => {
      const secondTripData = {
        ...mockTripData,
        id: 'different-id',
        cost: 800,
        duration: 7,
        type: 'train',
        display_name: 'from SYD to GRU by train',
      };

      const mockResponse = createMockAxiosResponse([
        mockTripData,
        secondTripData,
      ]);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result).toHaveLength(2);
      expect(result[0].cost).toBe(625);
      expect(result[1].cost).toBe(800);
      expect(result[0].type).toBe('flight');
      expect(result[1].type).toBe('train');
    });

    it('should return empty array when API returns null', async () => {
      const mockResponse = createMockAxiosResponse(null);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result).toEqual([]);
    });

    it('should return empty array when API returns undefined', async () => {
      const mockResponse = createMockAxiosResponse(undefined);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result).toEqual([]);
    });

    it('should return empty array when API returns non-array data', async () => {
      const mockResponse = createMockAxiosResponse({ error: 'No trips found' });
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result).toEqual([]);
    });

    it('should return empty array when API returns empty array', async () => {
      const mockResponse = createMockAxiosResponse([]);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      httpService.get.mockReturnValue(throwError(() => errorResponse));

      await expect(client.fetchTrips('SYD', 'GRU')).rejects.toEqual(
        errorResponse,
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      httpService.get.mockReturnValue(throwError(() => networkError));

      await expect(client.fetchTrips('SYD', 'GRU')).rejects.toThrow(
        'Network Error',
      );
    });

    it('should pass correct parameters for different origins and destinations', async () => {
      const mockResponse = createMockAxiosResponse([]);
      httpService.get.mockReturnValue(of(mockResponse));

      await client.fetchTrips('LAX', 'JFK');

      expect(httpService.get).toHaveBeenCalledWith(mockConfig.TRIPS_API_URL, {
        headers: { 'x-api-key': mockConfig.TRIPS_API_KEY },
        params: { origin: 'LAX', destination: 'JFK' },
      });
    });

    it('should handle trip data with missing optional fields gracefully', async () => {
      const incompleteTripData = {
        id: 'test-id',
        origin: 'SYD',
        destination: 'GRU',
        cost: 625,
        duration: 5,
        type: 'flight',
        display_name: 'from SYD to GRU by flight',
      };

      const mockResponse = createMockAxiosResponse([incompleteTripData]);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Trip);
    });

    it('should handle special characters in origin and destination', async () => {
      const mockResponse = createMockAxiosResponse([]);
      httpService.get.mockReturnValue(of(mockResponse));

      await client.fetchTrips('SÃO', 'GRÜ');

      expect(httpService.get).toHaveBeenCalledWith(mockConfig.TRIPS_API_URL, {
        headers: { 'x-api-key': mockConfig.TRIPS_API_KEY },
        params: { origin: 'SÃO', destination: 'GRÜ' },
      });
    });

    it('should handle HTTP status codes other than 200', async () => {
      const mockResponse: AxiosResponse = {
        data: [],
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as AxiosResponse['config'],
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('INVALID', 'CODES');

      expect(result).toEqual([]);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'ECONNABORTED';

      httpService.get.mockReturnValue(throwError(() => timeoutError));

      await expect(client.fetchTrips('SYD', 'GRU')).rejects.toThrow('Timeout');
    });
  });

  describe('createTrip (private method behavior)', () => {
    it('should correctly map all fields from external API to Trip entity', async () => {
      const customTripData = {
        id: 'custom-id-123',
        origin: 'LAX',
        destination: 'JFK',
        cost: 1200,
        duration: 8,
        type: 'business-flight',
        display_name: 'Premium flight from LAX to JFK',
      };

      const mockResponse = createMockAxiosResponse([customTripData]);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('LAX', 'JFK');

      expect(result[0].id).toBe(customTripData.id);
      expect(result[0].origin).toBe(customTripData.origin);
      expect(result[0].destination).toBe(customTripData.destination);
      expect(result[0].cost).toBe(customTripData.cost);
      expect(result[0].duration).toBe(customTripData.duration);
      expect(result[0].type).toBe(customTripData.type);
      expect(result[0].displayName).toBe(customTripData.display_name);
    });

    it('should handle numeric values correctly', async () => {
      const numericTripData = {
        id: 'numeric-test',
        origin: 'SYD',
        destination: 'GRU',
        cost: 0, // Edge case: zero cost
        duration: 1, // Edge case: minimum duration
        type: 'budget-flight',
        display_name: 'Budget option',
      };

      const mockResponse = createMockAxiosResponse([numericTripData]);
      httpService.get.mockReturnValue(of(mockResponse));

      const result = await client.fetchTrips('SYD', 'GRU');

      expect(result[0].cost).toBe(0);
      expect(result[0].duration).toBe(1);
      expect(typeof result[0].cost).toBe('number');
      expect(typeof result[0].duration).toBe('number');
    });
  });
});
