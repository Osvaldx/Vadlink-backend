import { ObjectId } from "mongoose";

export interface PayloadTokenFormat {
    id: ObjectId,
    firstName: string,
    lastName: string,
    username: string,
    rol: string,
    email: string,
    avatar: string,
    avatar_id: string,
    banner: string,
    banner_id: string
}