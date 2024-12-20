import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Додайте цей імпорт
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { JwtStrategy } from '../../strategy';

@Module({
  imports: [
    ConfigModule, // Додайте ConfigModule до imports
    UserModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
