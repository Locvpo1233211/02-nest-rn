import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async emailExists(email: string) {
    const user = await this.userModel.exists({ email });
    return user ? true : false;
  }
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
