import { ObjectId } from "mongodb";

export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserCredentialsEntity extends UserCredentials {
    _id: ObjectId;
    tokenVersion: number;
}

export interface UserJwtPayload {
    email: string;
    sub: string;
    iat: number;
    exp: number;
    tokenVersion: number;
}
