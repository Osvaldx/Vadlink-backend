import { Body, Controller, Post, Res, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUserDto } from './dto/auth-user-dto';
import type { Request, Response } from 'express';
import { JwtGuard } from '../../guards/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post("/register")
    @UseInterceptors(FileInterceptor('avatar'))
    public async signUp(@UploadedFile() file: Express.Multer.File, @Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.signUp(createUserDto, response, file);
    }

    @Post("/login")
    public signIn(@Body() authUserDto: AuthUserDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.signIn(authUserDto, response);
    }

    @UseGuards(JwtGuard)
    @Post('/logout')
    public signOut(@Res({ passthrough: true }) response: Response) {
        this.authService.signOut(response);
    }

    @UseGuards(JwtGuard)
    @Post('/data')
    public verify(@Req() request: Request) {
        return this.authService.verify(request);
    }

}
