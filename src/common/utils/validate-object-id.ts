import { BadRequestException } from "@nestjs/common";
import { isValidObjectId } from "mongoose";

export function ValidateObjectID(id: string): void {
    if(!isValidObjectId(id)) {
        throw new BadRequestException('ID invalida');
    }
}