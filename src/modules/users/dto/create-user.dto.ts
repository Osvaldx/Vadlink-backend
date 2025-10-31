import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, Max } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 20)
    firstName: string;
    
    @IsString()
    @IsOptional()
    lastName: string;
    
    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    @Max(120)
    age: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    password: string;
}
