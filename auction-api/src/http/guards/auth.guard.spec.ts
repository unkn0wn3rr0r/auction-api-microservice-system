import { AuthGuard } from './auth.guards';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthTransportationService } from 'src/core/services/transport/auth.transportation.service';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let service: AuthTransportationService;
    let context: Partial<ExecutionContext>;

    beforeEach(async () => {
        context = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: 'Bearer valid.jwt.token',
                    },
                }),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                {
                    provide: AuthTransportationService,
                    useValue: {
                        validateToken: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get(AuthGuard);
        service = module.get(AuthTransportationService);
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
        expect(service.validateToken).toHaveBeenCalledTimes(0);
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
        expect(service.validateToken).toHaveBeenCalledTimes(0);
    });

    it('should allow access when token is valid', async () => {
        (service.validateToken as jest.Mock).mockResolvedValueOnce(true);

        const result = await guard.canActivate(context as ExecutionContext);
        expect(result).toBe(true);

        expect(service.validateToken).toHaveBeenCalledWith('valid.jwt.token');
        expect(service.validateToken).toHaveBeenCalledTimes(1);
    });

    describe('When validateToken fails', () => {
        let contextInvalidAuth: Partial<ExecutionContext>;

        beforeEach(() => {
            contextInvalidAuth = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: jest.fn().mockReturnValue({
                        headers: {
                            authorization: 'Bearer invalid',
                        },
                    }),
                }),
            };
        });

        it('should deny access when token is invalid', async () => {
            (service.validateToken as jest.Mock).mockResolvedValueOnce(false);

            const result = await guard.canActivate(contextInvalidAuth as ExecutionContext);
            expect(result).toBe(false);

            expect(service.validateToken).toHaveBeenCalledWith('invalid');
            expect(service.validateToken).toHaveBeenCalledTimes(1);
        });

        it('should throw UnauthorizedException when validateToken throws error', async () => {
            (service.validateToken as jest.Mock).mockImplementation(() => {
                throw new Error('Some unexpected error');
            });

            await expect(guard.canActivate(contextInvalidAuth as ExecutionContext)).rejects.toThrow(new UnauthorizedException('Invalid token'));

            expect(service.validateToken).toHaveBeenCalledWith('invalid');
            expect(service.validateToken).toHaveBeenCalledTimes(1);
        });
    });
});
