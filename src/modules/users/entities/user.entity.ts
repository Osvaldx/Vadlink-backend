import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";

@Schema()
export class User {
    _id: ObjectId

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ required: true, unique: true})
    username: string;

    @Prop({enum: ['user', 'admin'], default: 'user'})
    rol: string;

    @Prop({ default: null })
    description: string

    @Prop({ required: true, type: Date })
    dateofbirth: Date;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, default: false })
    isDisabled: boolean

    @Prop({ default: process.env.AVATAR_DEFAULT })
    avatar: string

    @Prop({ default: process.env.AVATAR_DEFAULT_ID })
    avatar_id: string;

    @Prop({ default: process.env.BANNER_DEFAULT })
    banner: string

    @Prop({ default: process.env.BANNER_DEFAULT_ID })
    banner_id: string

    @Prop({ default: new Date() })
    createDate: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);