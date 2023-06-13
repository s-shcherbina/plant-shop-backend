import { CreateCustomerDTO } from 'src/modules/users/dtos';

export interface PayloadToken {
  id: number;
  role: string;
}

export interface AuthResponse {
  userData: CreateCustomerDTO;
  accessToken: string;
  refreshToken: string;
}

export enum Role {
  Customer = 'Customer',
  Admin = 'ADMIN',
  User = 'USER',
}
