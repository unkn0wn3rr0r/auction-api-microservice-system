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
            const result = await this.authCollection.insertOne({ ...user, _id: new ObjectId(), tokenVersion: 0 });
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

    async incrementTokenVersion(userId: ObjectId): Promise<void> {
        try {
            const result = await this.authCollection.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
            if (!result.acknowledged || !result.matchedCount || !result.modifiedCount) {
                throw new Error('Failed to update token version');
            }
        } catch (error) {
            this.logger.error(`Failed to increment token version: ${error.message}`);
            throw error;
        }
    }

    async isHealthy(): Promise<boolean> {
        try {
            const result = await this.db.command({ ping: 1 });
            return result.ok === 1;
        } catch (error) {
            this.logger.error(`DB health check failed: ${error.message}`);
            return false;
        }
    }
}
