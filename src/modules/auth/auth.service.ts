import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user-dto';

@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async signUp(createUserDto: CreateUserDto) {
        const userDB = await this.userModel.findOne({ email: createUserDto.email });
        
        if(userDB) {
            throw new HttpException("[!] Ese Email ya esta registrado", HttpStatus.CONFLICT)
        }
        
        const createdUser = new this.userModel(createUserDto);

        const saltOrRounds = 10;
        const password = createdUser.password;
        const hashPass = await bcrypt.hash(password, saltOrRounds);

        createdUser.set("password", hashPass);
        const result = await createdUser.save();
        return result;

        // Debe recibir la imágen de perfil, guardarla apropiadamente y guardar la URL en la base de datos. (PENDIENTE)
    }

    async signIn(authUserDto: AuthUserDto) {
        const userDB = await this.userModel.findOne({ email: authUserDto.email });

        if(!userDB) {
            throw new HttpException("[!] Usuario no encontrado", HttpStatus.NOT_FOUND);
        }

        const isMatch = await bcrypt.compare(authUserDto.password, userDB.password);

        if(!isMatch) {
            throw new HttpException("[!] La contraseña es incorrecta", HttpStatus.UNAUTHORIZED);
        }

        return userDB;
    }

}
