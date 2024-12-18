import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDTO } from '../user/dto';
import { AppError } from '../../common/constants/error';
import { UserLoginDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { AuthUserResponse } from './response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async registerUser(dto: CreateUserDTO): Promise<CreateUserDTO> {
    try {
      const existUser = await this.userService.findUserByEmail(dto.email);
      if (existUser) {
        throw new BadRequestException(AppError.USER_EXISTS);
      }
      return await this.userService.createUser(dto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error during user registration');
    }
  }

  async loginUser(dto: UserLoginDTO): Promise<AuthUserResponse> {
    try {
      const existUser = await this.userService.findUserByEmail(dto.email);
      if (!existUser) {
        throw new BadRequestException(AppError.USER_NOT_EXIST);
      }

      const validatePassword = await bcrypt.compare(
        dto.password,
        existUser.password,
      );

      if (!validatePassword) {
        throw new BadRequestException(AppError.WRONG_DATA);
      }

      const user = await this.userService.publicUser(dto.email);
      const token = await this.tokenService.generateJwtToken(user);

      return { user, token };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new InternalServerErrorException('Error during user login');
    }
  }
}
