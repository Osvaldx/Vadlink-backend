import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types, type ObjectId } from "mongoose";
import { User } from "src/modules/users/entities/user.entity";

@Schema()
export class Post {
    _id: ObjectId

    @Prop({ required: true })
    title: string;

    @Prop()
    description?: string;

    @Prop()
    url_img?: string;

    @Prop()
    url_img_id?: string;

    @Prop({ default: 0 })
    likes: number;

    @Prop({ default: 0 })
    shared: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true }) // ref: Entity.name -> para poder relacionarlo en la db
    user_id: ObjectId;

    @Prop()
    username: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: User.name }], default: [] })
    likedBy: Types.ObjectId[];

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: () => new Date() })
    created_at: Date;

}

export const PostSchema = SchemaFactory.createForClass(Post);