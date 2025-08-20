import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TripDocument = HydratedDocument<Trip>;

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true, unique: true })
  tripId: string;

  @Prop({ required: true })
  origin: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  displayName: string;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
