export const DATABASE_NAME = 'authdb';
export const MONGO_CLIENT = Symbol('mongo-client');
export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://mongodb:27017/auth';
export const AUTH_COLLECTION_NAME = 'user_credentials';
export const JWT_SECRET_NAME = 'JWT_SECRET';
export const JWT_SECRET_EXPIRATION_NAME = 'JWT_EXPIRES_IN';
