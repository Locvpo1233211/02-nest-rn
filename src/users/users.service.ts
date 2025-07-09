import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  // check if email exists
  async emailExists(email: string) {
    const user = await this.userModel.exists({ email });
    return user ? true : false;
  }
  // Create user
  async create(createUserDto: CreateUserDto) {
    const emailExists = await this.emailExists(createUserDto.email);
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await hashPasswordHelper(createUserDto.password);
    console.log(hashedPassword);
    const user = await this.userModel.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  async findAll(queryString, current, pageSize) {
    const { filter, sort } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;
    const skip = (current - 1) * pageSize;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .select('-password')
      .sort(sort as any);
    console.log(filter);
    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: result,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    const emailExists = await this.emailExists(updateUserDto.email);
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const { _id, ...rest } = updateUserDto;
    return await this.userModel
      .findByIdAndUpdate(_id, rest, { new: true })
      .select('-password');
  }

  async remove(_id: string) {
    if (!mongoose.isValidObjectId(_id)) {
      throw new BadRequestException('Invalid user2 id');
    }
    const user = await this.userModel.findById(_id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return await this.userModel.deleteOne({ _id });
  }

  // find user by email
  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  async handleRegister(body: any) {
    const emailExists = await this.emailExists(body.email);
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await hashPasswordHelper(body.password);
    const user = await this.userModel.create({
      email: body.email,
      name: body.name,
      password: hashedPassword,
      codeId: uuidv4(),
      codeExpired: dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    });
    return user;
    // Gửi email
  }

  // Lưu RefreshToken vào db
  async updateUserRefeshToken(refreshToken: string, _id: string) {
    await this.userModel.findByIdAndUpdate(_id, {
      refreshToken: refreshToken,
    });
  }
}
