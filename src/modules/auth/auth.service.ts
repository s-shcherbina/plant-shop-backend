import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { TokensService } from 'src/modules/tokens/tokens.service';
import { AuthResponse } from 'src/types';
import { UsersService } from 'src/modules/users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { CreateCustomerDTO, CreateUserDTO } from '../users/dtos';
import { LoginCustomerDTO, LoginUserDTO } from './dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokensService: TokensService,
  ) {}

  async createResponse(user: UserEntity): Promise<AuthResponse> {
    // const { id, role, password, email, createdAt, ...userData } = user;
    const { id, role } = user;
    const { email, password, token, createdAt, ...userData } = user;
    const tokens = this.tokensService.generateJwtTokens({ id, role });
    await this.tokensService.saveToken(tokens.refreshToken, id);
    return { userData, ...tokens };
  }

  async registerCustomer(dto: CreateCustomerDTO): Promise<AuthResponse> {
    const existUser = await this.usersService.findUserByPhone(dto.phone);
    if (existUser)
      throw new BadRequestException(
        `${dto.phone} закріплений за (іншим користувачем)!`,
      );
    const user = await this.usersService.createUser(dto);
    return this.createResponse(user);
  }

  async registerUser(dto: CreateUserDTO): Promise<AuthResponse> {
    const existUser = await this.usersService.findUserByPhone(dto.phone);

    console.log(existUser?.role);

    // if (user && user.role !== 'USER')

    if (existUser?.role !== 'CUSTOMER')
      throw new BadRequestException(`${dto.phone} вже існує! Увійдіть!`);
    dto.role = 'USER';
    const user = await this.usersService.findSuperUserByEmail(dto.email);
    if (user)
      throw new BadRequestException(`${dto.email} вже існує! Увійдіть!`);
    if (dto.email === process.env.MAIN_EMAIL) dto.role = 'ADMIN';

    dto.password = await this.usersService.hashPassword(dto.password);
    const newUser = await this.usersService.createUser(dto);
    return this.createResponse(newUser);
  }

  async loginCustomer(dto: LoginCustomerDTO): Promise<AuthResponse> {
    const user = await this.usersService.findUserByPhone(dto.phone);
    if (!user)
      throw new BadRequestException(
        `${dto.phone} незакріплений за жодним користувачем!`,
      );
    return this.createResponse({
      ...user,
      role: `CUSTOMER ${user.role.slice(0, 1)}`,
    });
  }

  async loginUser(dto: LoginUserDTO): Promise<AuthResponse> {
    const user = await this.usersService.findSuperUserByEmail(dto.email);
    if (!user)
      throw new BadRequestException(
        `${dto.email} незакріплений за жодним користувачем!`,
      );

    const validatePassword = await compare(dto.password, user.password);
    if (!validatePassword) throw new BadRequestException(`Помилка входу!`);

    return await this.createResponse(user);
  }

  async logout(refreshToken: string): Promise<string> {
    await this.tokensService.removeToken(refreshToken);
    return 'Bи вийшли з аккаунту';
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    try {
      if (!refreshToken) throw new UnauthorizedException(`Не авторизований`);

      const userDataToken =
        this.tokensService.validateRefreshToken(refreshToken);
      const tokenFromDb = await this.tokensService.findToken(refreshToken);
      if (!userDataToken || !tokenFromDb)
        throw new UnauthorizedException(`Не авторизований`);

      const user = await this.usersService.findUserById(userDataToken.id);
      return this.createResponse(user);
    } catch (e) {
      throw new UnauthorizedException(`Не авторизований`);
    }
  }
}
