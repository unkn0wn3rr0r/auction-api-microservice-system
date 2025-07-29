import { Test, TestingModule } from '@nestjs/testing';
import { AuthTransportationService } from './auth.transportation.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';

describe('AuthTransportationService', () => {
    let authTransportationService: AuthTransportationService;
    let httpService: HttpService;

    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthTransportationService,
                {
                    provide: HttpService,
                    useValue: {
                        get: jest.fn(),
                        post: jest.fn(),
                    },
                },
            ],
        }).compile();

        authTransportationService = module.get(AuthTransportationService);
        httpService = module.get(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateToken', () => {
        it('should return true when token is valid', async () => {
            (httpService.post as jest.Mock).mockReturnValue(of({ data: { isValid: true } }));

            const result = await authTransportationService.validateToken('valid.token');
            expect(result).toBe(true);
            expect(httpService.post).toHaveBeenCalledWith(
                'http://auth-api:3001/auth/validate',
                { token: 'valid.token' },
            );
            expect(loggerSpy).toHaveBeenCalledTimes(0);
        });

        it('should return false when token is invalid', async () => {
            (httpService.post as jest.Mock).mockReturnValue(of({ data: { isValid: false } }));

            const result = await authTransportationService.validateToken('invalid.token');
            expect(result).toBe(false);
            expect(httpService.post).toHaveBeenCalledWith(
                'http://auth-api:3001/auth/validate',
                { token: 'invalid.token' },
            );
            expect(loggerSpy).toHaveBeenCalledTimes(0);
        });

        it('should return false when response has no isValid field', async () => {
            (httpService.post as jest.Mock).mockReturnValue(of({ data: {} }));

            const result = await authTransportationService.validateToken('unknown.token');
            expect(result).toBe(false);
            expect(httpService.post).toHaveBeenCalledWith(
                'http://auth-api:3001/auth/validate',
                { token: 'unknown.token' },
            );
            expect(loggerSpy).toHaveBeenCalledTimes(0);
        });

        it('should rethrow the error from the upstream and log error when request fails', async () => {
            (httpService.post as jest.Mock).mockReturnValue(throwError(() => new Error('Service down')));

            await expect(authTransportationService.validateToken('any.token')).rejects.toThrow(new Error('Service down'));
            expect(httpService.post).toHaveBeenCalledWith(
                'http://auth-api:3001/auth/validate',
                { token: 'any.token' },
            );
            expect(loggerSpy).toHaveBeenCalledWith('Token validation failed: Service down');
            expect(loggerSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('isHealthy', () => {
        it('should return true when it is healthy', async () => {
            (httpService.get as jest.Mock).mockReturnValue(of({ data: { status: 'ok' } }));

            const result = await authTransportationService.isHealthy();
            expect(result).toBe(true);
            expect(httpService.get).toHaveBeenCalledWith('http://auth-api:3001/auth/monitor');
            expect(loggerSpy).toHaveBeenCalledTimes(0);
        });

        it('should return false when it is not healthy', async () => {
            (httpService.get as jest.Mock).mockReturnValue(of({ data: { status: 'fail' } }));

            const result = await authTransportationService.isHealthy();
            expect(result).toBe(false);
            expect(httpService.get).toHaveBeenCalledWith('http://auth-api:3001/auth/monitor');
            expect(loggerSpy).toHaveBeenCalledTimes(0);
        });

        it('should return false and log error when it is not healthy', async () => {
            (httpService.get as jest.Mock).mockReturnValue(throwError(() => new Error('Service down')));

            const result = await authTransportationService.isHealthy();
            expect(result).toBe(false);
            expect(httpService.get).toHaveBeenCalledWith('http://auth-api:3001/auth/monitor');
            expect(loggerSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).toHaveBeenCalledWith('Auth API health check failed: Service down');
        });
    });
});
