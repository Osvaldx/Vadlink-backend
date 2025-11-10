import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { type ObjectId, SchemaTypes } from "mongoose";
import { Post } from "src/modules/posts/entities/post.entity";
import { User } from "src/modules/users/entities/user.entity";

export class Comment {
    _id: ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: Post.name, required: true })
    post_id: ObjectId

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
    user_id: ObjectId;

    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ required: true })
    texto: string;

    @Prop({ type: SchemaTypes.Date, default: new Date() })
    created_at: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);