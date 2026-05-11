import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HospitalDocument = HydratedDocument<Hospital>;

@Schema({ timestamps: true })
export class Hospital {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string; // e.g. hospital-com

  // tenant identifier used for subdomain routing (e.g. "city" => city.hospital.com)
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  subdomain!: string;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
