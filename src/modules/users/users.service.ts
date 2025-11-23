/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, HttpException, HttpStatus, Injectable, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { ValidateObjectID } from '../../common/utils/validate-object-id';
import { IsAdminGuard } from 'src/guards/is-admin/is-admin.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as bcrypt from 'bcrypt';

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

  @UseGuards(IsAdminGuard)
  async findAll() {
    const result = await this.userModel.find();
    return result;
  }

  async findOneEmailOrUsername(email?: string, username?: string) {
    const or: any[] = [];

    if(email) {
      or.push({ email: email.toLowerCase() });
    }

    if(username) {
      or.push({ username });
    }

    return await this.userModel.findOne({ $or: or });
  }

  // ---------------------------------- //
  async findOneById(id: string) {
    const result = await this.userModel.findOne({ _id: id });
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userModel.updateOne({ _id: id }, updateUserDto);
    return result;
  }
  // ---------------------------------- //

  async disableOrEnableUser(userId: string, value: boolean) {
    ValidateObjectID(userId);

    const userDB = await this.findOneById(userId);
    if(!userDB) throw new HttpException('No se encontro ese usuario', HttpStatus.NOT_FOUND);

    userDB.isDisabled = value;
    const result = await userDB.save();

    if(result) {
      throw new HttpException('Estado de usuario actualizado', HttpStatus.OK);
    }

    throw new HttpException('No se pudo actualizar el estado del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async remove(id: string) {
    ValidateObjectID(id);
    const result = await this.userModel.deleteOne({ _id: id });

    return { message: (result.deletedCount >= 1) ? 'Se elimino el usuario' : 'No se elimino ningun usuario' };
  }

  async create(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const userEmail = await this.findOneEmailOrUsername(createUserDto.email.toLowerCase());
    // const userEmail = await this.userModel.findOne({ email: createUserDto.email.toLowerCase() });
    if (userEmail) throw new HttpException("Ese Email ya esta registrado", HttpStatus.CONFLICT);
  
    let uploadResult: UploadApiResponse | UploadApiErrorResponse | null = null;
    if (file) {
        uploadResult = await this.cloudService.uploadAvatar(file);
    }
  
    const newUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      avatar: uploadResult?.secure_url || process.env.AVATAR_DEFAULT,
      avatar_id: uploadResult?.public_id || process.env.AVATAR_DEFAULT_ID,
      banner: process.env.BANNER_DEFAULT,
      banner_id: process.env.BANNER_DEFAULT_ID,
    });
  
    const hashPass = await bcrypt.hash(newUser.password, 10);
    newUser.set("password", hashPass);
  
    const createdUser = await newUser.save();

    return createdUser;
  }

  async uploadAvatar(file: Express.Multer.File, req: Request) {

    if(file) {
      const extension = file.originalname.split('.').pop();
      if(extension && !['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
        throw new BadRequestException('Formato de imagen invalido');
      }
    }
    
    const user: userJwtData = req['user'];

    if (!user || !user.id) {
      throw new HttpException('No se pudo obtener el usuario autenticado', HttpStatus.UNAUTHORIZED);
    }

    const userDB = await this.findOneById(user.id);

    if (!userDB) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (userDB.avatar_id) {
      await this.cloudService.deleteImage(userDB.avatar_id);
    }

    const uploadResult = await this.cloudService.uploadAvatar(file);

    userDB.avatar = uploadResult.secure_url;
    userDB.avatar_id = uploadResult.public_id;

    const { errors } = await userDB.save();

    if(errors) {
      throw new HttpException({ message: 'Error al subir la imagen', error: errors }, HttpStatus.BAD_REQUEST);
    }

    return { message: 'Avatar actualizado!' }
  }
}
