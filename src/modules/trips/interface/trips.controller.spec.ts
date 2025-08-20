import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { SearchTripsService } from '@trips/application/services/search-trips.service';
import { SaveTripService } from '@trips/application/services/save-trip.service';
import { ListTripsService } from '@trips/application/services/list-trip.service';
import { DeleteTripService } from '@trips/application/services/delete-trip.service';
import { Trip } from '@trips/domain/entities/trip.entity';
import { SearchTripDto } from '@trips/application/dto/search-trip.dto';
import { CreateTripDto } from '@trips/application/dto/create-trip.dto';

describe('TripsController', () => {
  let controller: TripsController;
  let mockSearchTripsService: jest.Mocked<SearchTripsService>;
  let mockSaveTripService: jest.Mocked<SaveTripService>;
  let mockListTripsService: jest.Mocked<ListTripsService>;
  let mockDeleteTripService: jest.Mocked<DeleteTripService>;

  const mockTrip = new Trip(
    '507f1f77bcf86cd799439011',
    'SYD',
    'GRU',
    500,
    480,
    'flight',
    'Sydney to São Paulo Flight',
    'trip-123',
  );

  const mockTrips = [
    mockTrip,
    new Trip(
      '507f1f77bcf86cd799439012',
      'JFK',
      'LHR',
      800,
      420,
      'flight',
      'New York to London Flight',
      'trip-456',
    ),
  ];

  beforeEach(async () => {
    mockSearchTripsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SearchTripsService>;

    mockSaveTripService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SaveTripService>;

    mockListTripsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListTripsService>;

    mockDeleteTripService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteTripService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: SearchTripsService,
          useValue: mockSearchTripsService,
        },
        {
          provide: SaveTripService,
          useValue: mockSaveTripService,
        },
        {
          provide: ListTripsService,
          useValue: mockListTripsService,
        },
        {
          provide: DeleteTripService,
          useValue: mockDeleteTripService,
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    const searchDto: SearchTripDto = {
      origin: 'SYD',
      destination: 'GRU',
      sortBy: 'fastest',
    };

    it('should return search results with valid query parameters', async () => {
      mockSearchTripsService.execute.mockResolvedValue(mockTrips);

      const result = await controller.search(searchDto);

      expect(mockSearchTripsService.execute).toHaveBeenCalledWith(searchDto);
      expect(mockSearchTripsService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTrips);
    });

    it('should handle search with cheapest sorting', async () => {
      const cheapestSearchDto = { ...searchDto, sortBy: 'cheapest' as const };
      const cheapestTrips = [mockTrips[1], mockTrips[0]]; // Different order
      mockSearchTripsService.execute.mockResolvedValue(cheapestTrips);

      const result = await controller.search(cheapestSearchDto);

      expect(mockSearchTripsService.execute).toHaveBeenCalledWith(
        cheapestSearchDto,
      );
      expect(result).toEqual(cheapestTrips);
    });

    it('should return empty array when no trips found', async () => {
      mockSearchTripsService.execute.mockResolvedValue([]);

      const result = await controller.search(searchDto);

      expect(mockSearchTripsService.execute).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual([]);
    });

    it('should propagate BadRequestException from service', async () => {
      const error = new BadRequestException(
        'Origin and destination are required',
      );
      mockSearchTripsService.execute.mockRejectedValue(error);

      await expect(controller.search(searchDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockSearchTripsService.execute).toHaveBeenCalledWith(searchDto);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Trips API returned an invalid response');
      mockSearchTripsService.execute.mockRejectedValue(error);

      await expect(controller.search(searchDto)).rejects.toThrow(
        'Trips API returned an invalid response',
      );
    });
  });

  describe('save', () => {
    const createTripDto: CreateTripDto = {
      tripId: 'trip-123',
      origin: 'SYD',
      destination: 'GRU',
      cost: 500,
      duration: 480,
      type: 'flight',
      displayName: 'Sydney to São Paulo Flight',
    };

    it('should create trip with valid DTO', async () => {
      mockSaveTripService.execute.mockResolvedValue(mockTrip);

      const result = await controller.save(createTripDto);

      expect(mockSaveTripService.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          id: undefined, // No ID before save
          origin: 'SYD',
          destination: 'GRU',
          cost: 500,
          duration: 480,
          type: 'flight',
          displayName: 'Sydney to São Paulo Flight',
          tripId: 'trip-123', // Business identifier
        }),
      );
      expect(mockSaveTripService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTrip);
    });

    it('should map DTO to Trip entity correctly', async () => {
      mockSaveTripService.execute.mockResolvedValue(mockTrip);

      await controller.save(createTripDto);

      const tripArgument = mockSaveTripService.execute.mock.calls[0][0];
      expect(tripArgument).toBeInstanceOf(Trip);
      expect(tripArgument.id).toBeUndefined(); // No ID before save
      expect(tripArgument.origin).toBe('SYD');
      expect(tripArgument.destination).toBe('GRU');
      expect(tripArgument.cost).toBe(500);
      expect(tripArgument.duration).toBe(480);
      expect(tripArgument.type).toBe('flight');
      expect(tripArgument.displayName).toBe('Sydney to São Paulo Flight');
      expect(tripArgument.tripId).toBe('trip-123'); // Business identifier
    });

    it('should handle service errors during save', async () => {
      const error = new Error('Database save failed');
      mockSaveTripService.execute.mockRejectedValue(error);

      await expect(controller.save(createTripDto)).rejects.toThrow(
        'Database save failed',
      );
      expect(mockSaveTripService.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle duplicate trip errors', async () => {
      const error = new Error('E11000 duplicate key error');
      mockSaveTripService.execute.mockRejectedValue(error);

      await expect(controller.save(createTripDto)).rejects.toThrow(
        'E11000 duplicate key error',
      );
    });
  });

  describe('list', () => {
    it('should return all trips', async () => {
      mockListTripsService.execute.mockResolvedValue(mockTrips);

      const result = await controller.list();

      expect(mockListTripsService.execute).toHaveBeenCalledWith();
      expect(mockListTripsService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTrips);
    });

    it('should return empty array when no trips exist', async () => {
      mockListTripsService.execute.mockResolvedValue([]);

      const result = await controller.list();

      expect(mockListTripsService.execute).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockListTripsService.execute.mockRejectedValue(error);

      await expect(controller.list()).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockListTripsService.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    const tripId = '507f1f77bcf86cd799439011';

    it('should delete trip with valid ID', async () => {
      mockDeleteTripService.execute.mockResolvedValue(undefined);

      const result = await controller.delete(tripId);

      expect(mockDeleteTripService.execute).toHaveBeenCalledWith(tripId);
      expect(mockDeleteTripService.execute).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle non-existent trip', async () => {
      const error = new NotFoundException(
        'Trip with id 507f1f77bcf86cd799439011 not found',
      );
      mockDeleteTripService.execute.mockRejectedValue(error);

      await expect(controller.delete(tripId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDeleteTripService.execute).toHaveBeenCalledWith(tripId);
    });

    it('should handle invalid ID format', async () => {
      const invalidId = 'invalid-id';
      const error = new Error('Cast to ObjectId failed');
      mockDeleteTripService.execute.mockRejectedValue(error);

      await expect(controller.delete(invalidId)).rejects.toThrow(
        'Cast to ObjectId failed',
      );
      expect(mockDeleteTripService.execute).toHaveBeenCalledWith(invalidId);
    });

    it('should handle database errors during deletion', async () => {
      const error = new Error('Database deletion failed');
      mockDeleteTripService.execute.mockRejectedValue(error);

      await expect(controller.delete(tripId)).rejects.toThrow(
        'Database deletion failed',
      );
    });
  });

  describe('controller instantiation', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have all required services injected', () => {
      expect(controller['searchTripsService']).toBeDefined();
      expect(controller['saveTripService']).toBeDefined();
      expect(controller['listTripsService']).toBeDefined();
      expect(controller['deleteTripService']).toBeDefined();
    });
  });
});
