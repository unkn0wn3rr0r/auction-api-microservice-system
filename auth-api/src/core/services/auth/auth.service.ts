import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from 'src/persistence/repositories/auth/auth.repository';
import { JWT_SECRET_NAME } from 'src/utils/constants';
import { InvalidCredentialsException, UserAlreadyExistsException } from 'src/utils/custom-errors';
import { UserJwtPayload } from 'src/utils/models/user';
import { HashingService } from 'src/utils/models/hash';

@Injectable()
export class AuthService {
    private readonly jwtSecret: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly hashingService: HashingService,
        private readonly repository: AuthRepository,
    ) {
        this.jwtSecret = this.getJwtSecret();
    }

    async register(email: string, password: string): Promise<{ message: string }> {
        const userExists = await this.repository.userExists(email);
        if (userExists) {
            throw new UserAlreadyExistsException('User already exists');
        }

        const hashed = await this.hashingService.hash(password);
        await this.repository.createUserCredentials({ email, password: hashed });

        return { message: `User ${email} registered` };
    }

    async login(email: string, password: string): Promise<{ accessToken: string }> {
        const user = await this.repository.findUserByEmail(email);
        if (user == null || !(await this.hashingService.compare(password, user.password))) {
            throw new InvalidCredentialsException('Invalid credentials');
        }

        await this.repository.incrementTokenVersion(user._id);
        const payload = {
            sub: user._id.toHexString(),
            email: user.email,
            tokenVersion: user.tokenVersion + 1,
        };
        return {
            accessToken: await this.jwtService.signAsync(payload, { secret: this.jwtSecret }),
        };
    }

    async validateToken(token: string): Promise<UserJwtPayload> {
        const userJwtPayload = await this.jwtService.verifyAsync<UserJwtPayload>(token, { secret: this.jwtSecret }); // that throws if the token is invalid/malformed
        const user = await this.repository.findUserByEmail(userJwtPayload.email);
        if (user == null || user.tokenVersion !== userJwtPayload.tokenVersion) {
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
