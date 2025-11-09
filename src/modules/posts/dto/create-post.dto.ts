import { IsNumber, IsOptional, IsString, Length, Min } from "class-validator"
import type { ObjectId } from "mongoose"

export class CreatePostDto {

    @IsString()
    @Length(3, 100)
    title: string;

    @IsOptional()
    @IsString()
    @Length(10, 2000)
    description: string;

    @IsNumber()
    @Min(0)
    likes: number;

    @IsNumber()
    @Min(0)
    shared: number;

    @IsOptional()
    user_id: ObjectId;

    @IsOptional()
    username: string

    @IsOptional()
    url_img: string;

    @IsOptional()
    url_img_id: string;

}
