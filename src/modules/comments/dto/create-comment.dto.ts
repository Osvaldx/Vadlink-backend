import { IsOptional, IsString, Length } from "class-validator";

export class CreateCommentDto {    
    @IsString()
    @Length(1, 100)
    text: string;
    
    @IsOptional()
    created_at: Date;

}
