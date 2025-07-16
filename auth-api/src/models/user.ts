import { ObjectId } from "mongodb";

export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserCredentialsEntity extends UserCredentials {
    _id: ObjectId;
}

export interface UserJwtPayload {
    email: string
    sub: string;
    exp: number
    iat: number
}
