import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO, CreateCustomerDTO } from './dto';
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

  async findUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async createCustomer(dto: CreateCustomerDTO): Promise<UserEntity> {
    return this.userRepository.save({ ...dto });
  }

  async createUser(dto: CreateUserDTO): Promise<UserEntity> {
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

  async updateUser(id: number, dto: Partial<CreateUserDTO>) {
    await this.checkUserByPhoneAndId(id, dto.phone);
    const user = await this.findUserByEmail(dto.email);
    if (user && user.id != id)
      throw new BadRequestException(
        `${dto.email} закріплений за іншим користувачем!`,
      );
    await this.userRepository.update({ id }, { ...dto });
  }
}
