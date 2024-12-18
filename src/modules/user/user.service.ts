import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, UpdateUserDTO } from './dto';
import { Watchlist } from '../watchlist/models/watchlist.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
  ) {}

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new InternalServerErrorException('Error hashing password');
    }
  }

  async findUserByEmail(email: string) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      console.error('Find user by email error:', error);
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async createUser(dto: CreateUserDTO) {
    try {
      dto.password = await this.hashPassword(dto.password);
      await this.userRepository.create({
        firstName: dto.firstName,
        userName: dto.userName,
        email: dto.email,
        password: dto.password,
      });
      return dto;
    } catch (error) {
      console.error('Create user error:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async publicUser(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        attributes: { exclude: ['password'] },
        include: {
          model: Watchlist,
          required: false,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Public user error:', error);
      throw new InternalServerErrorException(
        'Error retrieving user information',
      );
    }
  }

  async updateUser(email: string, dto: UpdateUserDTO): Promise<UpdateUserDTO> {
    try {
      const [affectedRows] = await this.userRepository.update(dto, {
        where: { email },
      });

      if (affectedRows === 0) {
        throw new NotFoundException('User not found for update');
      }

      return dto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Update user error:', error);
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async deleteUser(email: string): Promise<boolean> {
    try {
      const deletedRows = await this.userRepository.destroy({
        where: { email },
      });

      if (deletedRows === 0) {
        throw new NotFoundException('User not found for deletion');
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Delete user error:', error);
      throw new InternalServerErrorException('Error deleting user');
    }
  }
}
