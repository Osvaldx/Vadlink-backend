import { IsOptional, IsString, Length } from "class-validator";
import { ObjectId } from "mongoose";

export class CreateCommentDto {
    post_id: ObjectId;
    
    @IsString()
    @Length(1, 100)
    texto: string;
    
    @IsOptional()
    created_at: Date;

}
