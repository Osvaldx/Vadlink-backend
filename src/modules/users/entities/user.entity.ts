import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";

@Schema()
export class User {
    _id: ObjectId

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName: string;

    @Prop({ required: true })
    age: number;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: new Date() })
    createDate: Date;

}

export const UserSchema = SchemaFactory.createForClass(User);