export const DATABASE_NAME = 'auctiondb';
export const MONGO_CLIENT = Symbol('mongo-client');
export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://mongodb:27017/auction';
export const AUCTION_COLLECTION_NAME = 'auction_items';
