import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip } from '@trips/domain/entities/trip.entity';
import {
  TripDocument,
  Trip as TripSchema,
} from '@trips/infrastructure/persistence/trip.schema';

@Injectable()
export class TripRepository {
  constructor(
    @InjectModel(TripSchema.name)
    private readonly tripModel: Model<TripDocument>,
  ) {}

  async save(trip: Trip): Promise<Trip> {
    const tripData = {
      tripId: trip.tripId, // Use the business tripId
      origin: trip.origin,
      destination: trip.destination,
      cost: trip.cost,
      duration: trip.duration,
      type: trip.type,
      displayName: trip.displayName,
    };
    const created = new this.tripModel(tripData);
    const saved = await created.save();

    // Return a new Trip entity with the MongoDB _id
    return new Trip(
      saved._id.toString(), // MongoDB generated _id
      trip.origin,
      trip.destination,
      trip.cost,
      trip.duration,
      trip.type,
      trip.displayName,
      trip.tripId,
    );
  }

  async findAll(): Promise<Trip[]> {
    const docs = await this.tripModel.find().exec();
    return docs.map(
      (doc) =>
        new Trip(
          doc._id.toString(),
          doc.origin,
          doc.destination,
          doc.cost,
          doc.duration,
          doc.type,
          doc.displayName,
          doc.tripId,
        ),
    );
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.tripModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
