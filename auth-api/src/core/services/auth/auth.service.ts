import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from 'src/persistence/repositories/auth/auth.repository';
import { JWT_SECRET_NAME } from 'src/utils/constants';
import * as bcrypt from 'bcrypt';
import { InvalidCredentialsException, UserAlreadyExistsException } from 'src/utils/custom-errors';
import { UserJwtPayload } from 'src/utils/models/user';

/*
    TODO: 
    
    Delete old jwt tokens or cache calls when the user tries to create a jwt, when he already has one.
*/

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly repository: AuthRepository,
    ) {
        this.jwtSecret = this.getJwtSecret();
    }

    async register(email: string, password: string): Promise<{ message: string }> {
        const userExists = await this.repository.userExists(email);
        if (userExists) {
            throw new UserAlreadyExistsException('User already exists');
        }

        const hashed = await bcrypt.hash(password, 10);
        await this.repository.createUserCredentials({ email, password: hashed });

        return { message: `User ${email} registered` };
    }

    async login(email: string, password: string): Promise<{ access_token: string }> {
        const user = await this.repository.findUserByEmail(email);
        if (user == null || !(await bcrypt.compare(password, user.password))) {
            throw new InvalidCredentialsException('Invalid credentials');
        }

        const payload = { sub: user._id.toHexString(), email: user.email };
        return {
            access_token: await this.jwtService.signAsync(payload, { secret: this.jwtSecret }),
        };
    }

    async validateToken(token: string): Promise<UserJwtPayload> {
        const userJwtPayload = await this.jwtService.verifyAsync<UserJwtPayload>(token, { secret: this.jwtSecret }); // that throws if the token is invalid/malformed
        const user = await this.repository.findUserByEmail(userJwtPayload.email);
        if (user == null) {
            throw new InvalidCredentialsException('Invalid credentials');
        }
        return userJwtPayload;
    }

    private getJwtSecret(): string {
        const secret = this.configService.get<string>(JWT_SECRET_NAME);
        if (!secret) {
            throw new Error(`${JWT_SECRET_NAME} not found in config`);
        }
        return secret;
    }
}
