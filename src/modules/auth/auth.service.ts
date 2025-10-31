import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async register(userDto: CreateUserDto) {
        const createdUser = new this.userModel(userDto);
        const result = await createdUser.save();
        return result
    }

}
