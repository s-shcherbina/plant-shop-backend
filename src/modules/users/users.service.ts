import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO, CreateCustomerDTO } from './dtos';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hash(password, 5);
  }

  async findUserByPhone(phone: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ phone });
  }

  async findUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async findSuperUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async createUser(dto: CreateCustomerDTO): Promise<UserEntity> {
    return this.userRepository.save({ ...dto });
  }

  async createSuperUser(dto: CreateUserDTO): Promise<UserEntity> {
    return this.userRepository.save({ ...dto });
  }

  async checkUserByPhoneAndId(id: number, phone: string) {
    const user = await this.findUserByPhone(phone);
    if (user && user.id != id)
      if (user)
        throw new BadRequestException(
          `${phone} закріплений за іншим користувачем!`,
        );
  }

  async removeUser(id: number): Promise<string> {
    await this.userRepository.delete({ id });
    return 'Видалено';
  }

  async getAllUsers() {
    return await this.userRepository.find();
  }
}
