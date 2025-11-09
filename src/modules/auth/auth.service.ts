/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user-dto';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<User>, private readonly cloudService: CloudinaryService) {}
    
    async signUp(createUserDto: CreateUserDto, response: Response, file?: Express.Multer.File) {
        const userEmail = await this.userModel.findOne({ email: createUserDto.email.toLowerCase() });
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
        const token = this.createToken(createdUser);
        this.saveInCookie(token, response);
      
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = createdUser.toObject();
        return { ...userSafe, password: '$hash' };
      }
    // -------------------------------------------------------------------------------- //
    
    // -------------------------------------------------------------------------------- //
    async signIn(authUserDto: AuthUserDto, response: Response) {
        const userDB = await this.userModel.findOne({
            $or: [
                { email: authUserDto.emailOrUsername.toLowerCase() },
                { username: authUserDto.emailOrUsername }
            ]
        });
        
        if(!userDB) {
            throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }
        
        const isMatch = await bcrypt.compare(authUserDto.password, userDB.password);
        if(!isMatch) {
            throw new HttpException("La contraseña es incorrecta", HttpStatus.UNAUTHORIZED);
        }
        
        const token = this.createToken(userDB);
        this.saveInCookie(token, response);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = userDB.toObject();

        return { ...userSafe, password: '$hash' };
    }
    // -------------------------------------------------------------------------------- //

    // -------------------------------------------------------------------------------- //
    signOut(response: Response) {
        response.cookie('token', '', {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          expires: new Date(0)
        });
      
        return response.json({ message: 'Sesión cerrada correctamente' });
      }
    // -------------------------------------------------------------------------------- //
    
    // -------------------------------------------------------------------------------- //
    async verify(request: Request) {
        const payload = request['user'];
        
        const user = await this.userModel.findById(payload.id);
        if(!user) {
            throw new HttpException('Usuario no encontrado', HttpStatus.BAD_REQUEST);
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = user.toObject();
        return { ...userSafe, password: '$hash' };
    }
    // -------------------------------------------------------------------------------- //

    // -------------------------------------------------------------------------------- //
    private createToken(userDB: User): string {
        const token = jwt.sign({
            payload: {
                id: userDB._id,
                firstName: userDB.firstName,
                lastName: userDB.lastName,
                username: userDB.username,
                rol: userDB.rol,
                email: userDB.email,
                avatar: userDB.avatar,
                avatar_id: userDB.avatar_id,
                banner: userDB.banner,
                banner_id: userDB.banner_id
            }},
            process.env.SECRET_KEY!, { expiresIn: '15m' });

        return token;
    }
    // -------------------------------------------------------------------------------- //
    private saveInCookie(token: string, response: Response): void {
        response.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            expires: new Date(Date.now() + (1000 * 60 * 15))
        });
    }
    // -------------------------------------------------------------------------------- //
}
