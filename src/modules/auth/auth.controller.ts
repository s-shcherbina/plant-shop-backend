import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthResponse } from 'src/types';
import { AuthService } from './auth.service';
import { CreateCustomerDTO, CreateUserDTO } from '../users/dto';
import { LoginCustomerDTO, LoginUserDTO } from './dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserId } from 'src/decorators/user.id.decorators';

const maxAge = 60 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register_customer')
  async registerCustomer(
    @Body() dto: CreateCustomerDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userData = await this.authService.registerCustomer(dto);
    res.cookie('refreshToken', userData.refreshToken, {
      // maxAge: 60 * 24 * 60 * 60 * 1000,
      maxAge: maxAge,
      httpOnly: true,
    });
    return userData;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('register_user')
  async registerUser(
    @Body() dto: CreateUserDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userData = await this.authService.registerUser(dto);
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }

  @Post('login_customer')
  async loginCustomer(
    @Body() dto: LoginCustomerDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userData = await this.authService.loginCustomer(dto);
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }

  @Post('login_user')
  async loginUser(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userData = await this.authService.loginUser(dto);
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const { refreshToken } = req.cookies;
    const response = await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return response;
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { refreshToken } = req.cookies;
    const response = await this.authService.refresh(refreshToken);
    res.cookie('refreshToken', response.refreshToken, {
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('customer')
  async updateCustomer(
    @Body() dto: Partial<CreateCustomerDTO>,
    @UserId() id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const customerData = await this.authService.updateCustomer(id, dto);
    res.cookie('refreshToken', customerData.refreshToken, {
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return customerData;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user')
  async updateUser(
    @Body() dto: Partial<CreateUserDTO>,
    @UserId() id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const userData = await this.authService.updateUser(id, dto);
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 60 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return userData;
  }
}
