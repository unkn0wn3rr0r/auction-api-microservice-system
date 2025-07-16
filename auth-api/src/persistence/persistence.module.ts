import { Module } from '@nestjs/common';
import { mongoClientProvider } from './mongo-client';
import { MONGO_CLIENT } from 'src/utils/constants';

@Module({
    providers: [
        {
            provide: MONGO_CLIENT,
            useFactory: mongoClientProvider,
        },
    ],
    exports: [MONGO_CLIENT],
})
export class PersistenceModule { }
