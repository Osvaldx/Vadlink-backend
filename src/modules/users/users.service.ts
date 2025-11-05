/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

export interface userJwtData {
  id: string,
  firstName: string,
  lastName: string,
  username: string,
  rol: string,
  email: string
}

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly cloudService: CloudinaryService) {}

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

  async uploadAvatar(file: Express.Multer.File, req: Request) {
    const user: userJwtData = req['user'];

    if (!user || !user.id) {
      throw new HttpException('[!] No se pudo obtener el usuario autenticado', HttpStatus.UNAUTHORIZED);
    }

    const userDB = await this.findOne(user.id);

    if (!userDB) {
      throw new HttpException('[!] Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (userDB.avatar_id) {
      await this.cloudService.deleteImage(userDB.avatar_id);
    }

    const uploadResult = await this.cloudService.uploadImage(file);

    userDB.avatar = uploadResult.secure_url;
    userDB.avatar_id = uploadResult.public_id;

    const { errors } = await userDB.save();

    if(errors) {
      throw new HttpException({ message: '[!] Error al subir la imagen', error: errors }, HttpStatus.BAD_REQUEST);
    }

    return { message: '[+] Avatar actualizado!' }
  }
}
