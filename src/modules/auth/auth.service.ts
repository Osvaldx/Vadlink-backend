/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { AuthUserDto } from './dto/auth-user-dto';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

    constructor(private readonly usersService: UsersService) {}
    
    async signUp(createUserDto: CreateUserDto, file?: Express.Multer.File) {
        const createdUser = await this.usersService.create(createUserDto, file);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = createdUser.toObject();
        return { ...userSafe, password: '$hash' };
      }
    // -------------------------------------------------------------------------------- //
    
    // -------------------------------------------------------------------------------- //
    async signIn(authUserDto: AuthUserDto, response: Response) {
        const userDB = await this.usersService.findOneEmailOrUsername(
            authUserDto.emailOrUsername.toLowerCase(),
            authUserDto.emailOrUsername
        );
        
        if(!userDB) {
            throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
        }

        if(userDB.isDisabled) {
            throw new HttpException("Cuenta Suspendida", HttpStatus.FORBIDDEN);
        }
        
        const isMatch = await bcrypt.compare(authUserDto.password, userDB.password);
        if(!isMatch) {
            throw new HttpException("La contraseña es incorrecta", HttpStatus.UNAUTHORIZED);
        }
        
        const token = this.createToken(userDB);
        this.saveInCookie(token, response);

        const decoded = jwt.decode(token) as jwt.JwtPayload;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = userDB.toObject();

        return { ...userSafe, exp: decoded.exp };
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
    async authorize(request: Request) {
        const payload = request['user'];
        
        const user = await this.usersService.findOneById(payload.id as string);
        if(!user) {
            throw new HttpException('Usuario no encontrado', HttpStatus.UNAUTHORIZED);
        }
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userSafe } = user.toObject();
        return { ...userSafe, exp: payload.exp };
    }
    // -------------------------------------------------------------------------------- //

    // -------------------------------------------------------------------------------- //
    async refresh(request: Request, response: Response) {
        const payload = request['user'];
    
        const user = await this.usersService.findOneById(payload.id as string);
        if (!user) {
            throw new HttpException('Usuario no encontrado', HttpStatus.UNAUTHORIZED);
        }
    
        const newToken = this.createToken(user);
        this.saveInCookie(newToken, response);

        const decoded = jwt.decode(newToken) as jwt.JwtPayload;
    
        return { message: "Token renovado", exp: decoded.exp };
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
