import { IsOptional, IsString, Length } from "class-validator";
import { ObjectId } from "mongoose";

export class CreateCommentDto {
    post_id: ObjectId;

    user_id: ObjectId;
    
    @IsString()
    username: string;
    
    @IsString()
    firstName: string;
    
    @IsString()
    @IsOptional()
    lastName: string;
    
    @IsString()
    @Length(1, 50)
    texto: string;
    
    @IsOptional()
    created_at: Date;

}
