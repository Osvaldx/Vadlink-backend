import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 20)
    firstName: string;
    
    @IsString()
    @IsOptional()
    lastName: string;

    @IsString()
    @Length(3, 20)
    username: string;

    @IsEnum(['usuario', 'administrador'])
    @IsOptional()
    rol: string
    
    @IsString()
    @IsOptional()
    @Length(1, 20)
    description: string;
    
    @IsNotEmpty()
    @IsDateString()
    dateofbirth: Date;
    
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    password: string;

    @IsString()
    @IsOptional()
    avatar: string
}
