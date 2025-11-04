import { Body, Controller, Post, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUserDto } from './dto/auth-user-dto';
import type { Request, Response } from 'express';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post("/register")
    public signUp(@Body() createUserDto: CreateUserDto, @Res() response: Response) {
        return this.authService.signUp(createUserDto, response);
    }

    @Post("/login")
    public signIn(@Body() authUserDto: AuthUserDto, @Res({ passthrough: true }) response: Response) {
        return this.authService.signIn(authUserDto, response);
    }

    @UseGuards(JwtGuard)
    @Post('/data')
    public verify(@Req() request: Request) {
        return this.authService.verify(request);
    }

}
