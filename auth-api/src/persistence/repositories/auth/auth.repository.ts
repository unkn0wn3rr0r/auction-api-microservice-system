import { Injectable, Inject, Logger } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { UserCredentials, UserCredentialsEntity } from 'src/utils/models/user';
import { AUTH_COLLECTION_NAME, MONGO_CLIENT } from 'src/utils/constants';

@Injectable()
export class AuthRepository {
    private readonly logger = new Logger(AuthRepository.name);
    private readonly authCollection: Collection<UserCredentialsEntity>;

    constructor(@Inject(MONGO_CLIENT) private readonly db: Db) {
        this.authCollection = this.db.collection<UserCredentialsEntity>(AUTH_COLLECTION_NAME);
    }

    async findUserByEmail(email: string): Promise<UserCredentialsEntity | null> {
        return this.authCollection.findOne({ email });
    }

    async createUserCredentials(user: UserCredentials): Promise<void> {
        try {
            const result = await this.authCollection.insertOne({ ...user, _id: new ObjectId() });
            if (!result.acknowledged) {
                throw new Error(`Failed to create user credentials for ${user.email}`);
            }
        } catch (error) {
            this.logger.error(`Failed to create user credentials for ${user.email}: ${error.message}`);
            throw error;
        }
    }

    async userExists(email: string): Promise<boolean> {
        const user = await this.findUserByEmail(email);
        return !!user;
    }
}
