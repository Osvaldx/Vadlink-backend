import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), CloudinaryModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
