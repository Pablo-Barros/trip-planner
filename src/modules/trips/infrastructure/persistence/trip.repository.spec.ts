import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TripRepository } from './trip.repository';
import { Trip } from '@trips/domain/entities/trip.entity';
import { Trip as TripSchema, TripDocument } from './trip.schema';

describe('TripRepository', () => {
  let repository: TripRepository;
  let mockModel: jest.Mocked<Model<TripDocument>>;
  let mockSave: jest.Mock;

  const mockTrip = new Trip(
    '507f1f77bcf86cd799439011',
    'New York',
    'London',
    500,
    480,
    'flight',
    'NYC to LDN Flight',
    'trip-123',
  );

  beforeEach(async () => {
    mockSave = jest.fn();

    const mockDocument = {
      save: mockSave,
    };

    mockModel = {
      find: jest.fn(),
      deleteOne: jest.fn(),
    } as any;

    // Mock the Model constructor
    (mockModel as any) = jest.fn().mockImplementation(() => mockDocument);
    mockModel.find = jest.fn();
    mockModel.deleteOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripRepository,
        {
          provide: getModelToken(TripSchema.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<TripRepository>(TripRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a trip and return a trip with MongoDB _id', async () => {
      const mockSavedDocument = {
        _id: { toString: () => '507f1f77bcf86cd799439022' },
        origin: 'New York',
        destination: 'London',
        cost: 500,
        duration: 480,
        type: 'flight',
        displayName: 'NYC to LDN Flight',
        tripId: 'trip-123',
      };

      mockSave.mockResolvedValue(mockSavedDocument);
      (mockModel as any).mockReturnValue({
        ...mockSavedDocument,
        save: mockSave,
      });

      const result = await repository.save(mockTrip);

      expect(mockModel).toHaveBeenCalledWith({
        tripId: mockTrip.tripId, // Should use trip.tripId, not trip.id
        origin: 'New York',
        destination: 'London',
        cost: 500,
        duration: 480,
        type: 'flight',
        displayName: 'NYC to LDN Flight',
      });
      expect(mockSave).toHaveBeenCalled();

      // Should return a new Trip entity with MongoDB _id
      expect(result).toBeInstanceOf(Trip);
      expect(result.id).toBe('507f1f77bcf86cd799439022'); // MongoDB _id
      expect(result.tripId).toBe('trip-123'); // Business tripId
      expect(result.origin).toBe('New York');
    });

    it('should handle save errors', async () => {
      const saveError = new Error('Database save failed');
      mockSave.mockRejectedValue(saveError);

      await expect(repository.save(mockTrip)).rejects.toThrow(
        'Database save failed',
      );
    });

    it('should handle validation errors for duplicate tripId', async () => {
      const validationError = new Error('E11000 duplicate key error');
      validationError.name = 'MongoServerError';
      mockSave.mockRejectedValue(validationError);

      await expect(repository.save(mockTrip)).rejects.toThrow(
        'E11000 duplicate key error',
      );
    });
  });

  describe('findAll', () => {
    it('should return empty array when no trips exist', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await repository.findAll();

      expect(mockModel.find).toHaveBeenCalledWith();
      expect(result).toEqual([]);
    });

    it('should return all trips with proper domain entity mapping', async () => {
      const mockDocuments = [
        {
          _id: { toString: () => '507f1f77bcf86cd799439011' },
          tripId: 'trip-123',
          origin: 'New York',
          destination: 'London',
          cost: 500,
          duration: 480,
          type: 'flight',
          displayName: 'NYC to LDN Flight',
        },
        {
          _id: { toString: () => '507f1f77bcf86cd799439012' },
          tripId: 'trip-456',
          origin: 'Paris',
          destination: 'Rome',
          cost: 300,
          duration: 360,
          type: 'train',
          displayName: 'Paris to Rome Train',
        },
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocuments),
      } as any);

      const result = await repository.findAll();

      expect(mockModel.find).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Trip);
      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[0].origin).toBe('New York');
      expect(result[0].destination).toBe('London');
      expect(result[0].cost).toBe(500);
      expect(result[0].duration).toBe(480);
      expect(result[0].type).toBe('flight');
      expect(result[0].displayName).toBe('NYC to LDN Flight');
      expect(result[0].tripId).toBe('trip-123');

      expect(result[1]).toBeInstanceOf(Trip);
      expect(result[1].id).toBe('507f1f77bcf86cd799439012');
      expect(result[1].tripId).toBe('trip-456');
    });

    it('should correctly map MongoDB _id to Trip entity id', async () => {
      const mockDocument = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        tripId: 'trip-123',
        origin: 'New York',
        destination: 'London',
        cost: 500,
        duration: 480,
        type: 'flight',
        displayName: 'NYC to LDN Flight',
      };

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDocument]),
      } as any);

      const result = await repository.findAll();

      expect(result[0].id).toBe('507f1f77bcf86cd799439011');
      expect(result[0].tripId).toBe('trip-123');
    });

    it('should handle database query errors', async () => {
      const dbError = new Error('Database connection failed');
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(dbError),
      } as any);

      await expect(repository.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('deleteById', () => {
    it('should return true when trip is successfully deleted', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      } as any);

      const result = await repository.deleteById('507f1f77bcf86cd799439011');

      expect(mockModel.deleteOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
      });
      expect(result).toBe(true);
    });

    it('should return false when trip with given ID does not exist', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      } as any);

      const result = await repository.deleteById('nonexistent-id');

      expect(mockModel.deleteOne).toHaveBeenCalledWith({
        _id: 'nonexistent-id',
      });
      expect(result).toBe(false);
    });

    it('should use correct MongoDB query with _id field', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      } as any);

      await repository.deleteById('507f1f77bcf86cd799439011');

      expect(mockModel.deleteOne).toHaveBeenCalledWith({
        _id: '507f1f77bcf86cd799439011',
      });
    });

    it('should handle database deletion errors', async () => {
      const dbError = new Error('Database deletion failed');
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(dbError),
      } as any);

      await expect(
        repository.deleteById('507f1f77bcf86cd799439011'),
      ).rejects.toThrow('Database deletion failed');
    });

    it('should handle invalid ObjectId format gracefully', async () => {
      const castError = new Error('Cast to ObjectId failed');
      castError.name = 'CastError';
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(castError),
      } as any);

      await expect(repository.deleteById('invalid-id')).rejects.toThrow(
        'Cast to ObjectId failed',
      );
    });
  });
});
