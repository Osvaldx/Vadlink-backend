import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user-dto';
import jwt, { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    // -------------------------------------------------------------------------------- //
    async signUp(createUserDto: CreateUserDto, response: Response) {
        const userEmail = await this.userModel.findOne({ email: createUserDto.email.toLowerCase() });
        if(userEmail) {
            throw new HttpException("[!] Ese Email ya esta registrado", HttpStatus.CONFLICT);
        }

        const userUsername = await this.userModel.findOne({ username: createUserDto.username });
        if(userUsername) {
            throw new HttpException("[!] Ese Username ya existe!", HttpStatus.CONFLICT);
        }
        
        const newUser = new this.userModel({...createUserDto, email: createUserDto.email.toLowerCase()});

        const saltOrRounds = 10;
        const pass = newUser.password;
        const hashPass = await bcrypt.hash(pass, saltOrRounds);

        newUser.set("password", hashPass);
        const createdUser = await newUser.save();

        if(createdUser.errors) {
            throw new HttpException(createdUser.errors.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const token = this.createToken(createdUser);
        this.saveInCookie(token, response);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = createdUser.toObject();

        return {...userSafe, password: '$hash'};
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
            throw new HttpException("[!] Usuario no encontrado", HttpStatus.NOT_FOUND);
        }
        
        const isMatch = await bcrypt.compare(authUserDto.password, userDB.password);
        if(!isMatch) {
            throw new HttpException("[!] La contraseña es incorrecta", HttpStatus.UNAUTHORIZED);
        }
        
        const token = this.createToken(userDB);
        this.saveInCookie(token, response);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = userDB.toObject();

        return { ...userSafe, password: '$hash' };
    }
    // -------------------------------------------------------------------------------- //
    
    // -------------------------------------------------------------------------------- //
    public verify(request: Request): JwtPayload | string {
        const token = request.cookies['token'] as string;
        try {
            const validate = jwt.verify(token, process.env.SECRET_KEY!);
            return validate;
        } catch(error) {
            if(error instanceof TokenExpiredError) {
                throw new HttpException('[!] Token Expirado', HttpStatus.UNAUTHORIZED);
            }
            
            if(error instanceof JsonWebTokenError) {
                throw new HttpException('[!] Fallo la firma del token', HttpStatus.UNAUTHORIZED);
            }
        }

        throw new InternalServerErrorException();
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
                avatar_id: userDB.avatar_id
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
