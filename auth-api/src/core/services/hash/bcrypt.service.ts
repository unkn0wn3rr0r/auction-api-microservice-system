import { HashingService } from "src/utils/models/hash";
import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class BcryptService implements HashingService {
    async hash(data: string | Buffer): Promise<string> {
        const salt = await bcrypt.genSalt(saltRounds);
        return bcrypt.hash(data, salt);
    }

    async compare(data: string | Buffer, encrypted: string): Promise<boolean> {
        return bcrypt.compare(data, encrypted);
    }
}
