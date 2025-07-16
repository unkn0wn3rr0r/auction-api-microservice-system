import { AuthGuard } from './auth.guards';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let context: Partial<ExecutionContext>;

    const mockedAxios = axios as jest.Mocked<typeof axios>;

    beforeEach(() => {
        guard = new AuthGuard();
        context = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: 'Bearer valid.jwt.token',
                    },
                }),
            }),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw UnauthorizedException if Authorization header is missing', async () => {
        const contextNoAuthHeader: Partial<ExecutionContext> = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {},
                }),
            }),
        };

        await expect(guard.canActivate(contextNoAuthHeader as ExecutionContext)).rejects.toThrow(new UnauthorizedException('Missing or invalid Authorization header'));
        expect(mockedAxios.post).toHaveBeenCalledTimes(0);
    });

    it('should throw UnauthorizedException if Authorization header is invalid', async () => {
        const contextInvalidAuth: Partial<ExecutionContext> = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: 'invalid',
                    },
                }),
            }),
        };

        await expect(guard.canActivate(contextInvalidAuth as ExecutionContext)).rejects.toThrow(new UnauthorizedException('Missing or invalid Authorization header'));
        expect(mockedAxios.post).toHaveBeenCalledTimes(0);
    });

    it('should allow access when token is valid', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { isValid: true } });

        const result = await guard.canActivate(context as ExecutionContext);
        expect(result).toBe(true);
        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://auth-api:3001/auth/validate',
            { token: 'valid.jwt.token' },
        );
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should deny access when token is invalid', async () => {
        mockedAxios.post.mockRejectedValue(new Error('Invalid token'));

        await expect(guard.canActivate(context as ExecutionContext)).rejects.toThrow(new UnauthorizedException('Invalid token'));

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
});
