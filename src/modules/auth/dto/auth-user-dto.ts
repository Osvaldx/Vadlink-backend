import { IsNotEmpty, IsString, Length } from "class-validator";

export class AuthUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    emailOrUsername: string;
    
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    password: string;
}