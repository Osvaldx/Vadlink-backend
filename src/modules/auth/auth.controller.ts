import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post("/register")
    public register(@Body() userDto: CreateUserDto) {
        return this.authService.register(userDto);
    }

    @Post("/login")
    public login() {
        return this.authService;
    }

}
