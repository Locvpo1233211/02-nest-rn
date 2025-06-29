import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  name: string;
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;

  @IsOptional()
  image: string;
}
