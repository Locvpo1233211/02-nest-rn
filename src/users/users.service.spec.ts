import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(async () => {
    userModel = {
      exists: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      findById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('emailExists', () => {
    it('should return true if user exists', async () => {
      userModel.exists.mockResolvedValue(true);
      expect(await service.emailExists('test@mail.com')).toBe(true);
    });
    it('should return false if user does not exist', async () => {
      userModel.exists.mockResolvedValue(null);
      expect(await service.emailExists('test@mail.com')).toBe(false);
    });
  });

  describe('create', () => {
    it('should throw if email exists', async () => {
      jest.spyOn(service, 'emailExists').mockResolvedValue(true);
      await expect(
        service.create({ email: 'a@mail.com', password: '123' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findUserByEmail', () => {
    it('should call userModel.findOne', async () => {
      userModel.findOne.mockResolvedValue({ email: 'a@mail.com' });
      const result = await service.findUserByEmail('a@mail.com');
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'a@mail.com' });
      expect(result).toEqual({ email: 'a@mail.com' });
    });
  });
});
