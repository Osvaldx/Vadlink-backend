import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";

@Schema()
export class User {
    _id: ObjectId

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ required: true})
    username: string;

    @Prop({enum: ['usuario', 'administrador'], default: 'usuario'})
    rol: string;

    @Prop()
    description: string

    @Prop({ required: true, type: Date })
    dateofbirth: Date;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    avatar: string

    @Prop({ default: new Date() })
    createDate: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);