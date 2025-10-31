import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthUserDto } from './dto/auth-user-dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post("/register")
    public signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Post("/login")
    public signIn(@Body() authUserDto: AuthUserDto) {
        return this.authService.signIn(authUserDto);
    }

}
