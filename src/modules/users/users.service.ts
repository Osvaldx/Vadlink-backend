import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll() {
    const result = await this.userModel.find();
    return result;
  }

  async findOne(id: string) {
    const result = await this.userModel.findOne({ _id: id });
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userModel.updateOne({ _id: id }, updateUserDto);
    return result;
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ _id: id });

    return { message: (result.deletedCount >= 1) ? '[+] Se elimino el usuario' : '[-] No se elimino ningun usuario' };
  }
}
