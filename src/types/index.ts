import { CreateUserDTO } from 'src/modules/users/dto';

export interface PayloadToken {
  id: number;
  role: string;
}

export interface AuthResponse {
  userData: CreateUserDTO;
  accessToken: string;
  refreshToken: string;
}

export enum Role {
  Customer = 'Customer',
  Admin = 'ADMIN',
  User = 'USER',
}
