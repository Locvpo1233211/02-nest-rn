import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  image: string;

  @Prop({ default: 'USER' })
  role: string;

  @Prop()
  refreshToken: string;

  @Prop({ default: 'LOCAL' })
  accountType: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  codeId: string;

  @Prop({ default: false })
  codeExpired: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
