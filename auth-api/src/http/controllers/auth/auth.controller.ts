import { Controller, Post, Body, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from 'src/core/services/auth/auth.service';
import { UserCredentials, UserJwtPayload } from 'src/utils/models/user';
import { InvalidCredentialsException, UserAlreadyExistsException } from 'src/utils/custom-errors';

@Controller('/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/register')
    async register(@Body() credentials: UserCredentials): Promise<{ message: string }> {
        try {
            return await this.authService.register(credentials.email, credentials.password);
        } catch (error) {
            if (error instanceof UserAlreadyExistsException) {
                throw new ConflictException(error.message);
            }
            throw error;
        }
    }

    @Post('/login')
    async login(@Body() credentials: UserCredentials): Promise<{ access_token: string }> {
        try {
            return await this.authService.login(credentials.email, credentials.password);
        } catch (error) {
            if (error instanceof InvalidCredentialsException) {
                throw new UnauthorizedException(error.message);
            }
            throw error;
        }
    }

    @Post('/validate')
    async validateToken(@Body('token') token: string): Promise<{ isValid: true, user: UserJwtPayload }> {
        try {
            const jwtUserPayload = await this.authService.validateToken(token);
            return { isValid: true, user: jwtUserPayload };
        } catch (error) {
            if (error instanceof InvalidCredentialsException) {
                throw new UnauthorizedException(error.message);
            }
            throw new UnauthorizedException('Invalid token');
        }
    }
}
