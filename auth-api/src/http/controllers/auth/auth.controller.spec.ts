import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/core/services/auth/auth.service';
import { InvalidCredentialsException, UserAlreadyExistsException } from 'src/utils/custom-errors';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('should return success message on registration', async () => {
      authService.register.mockResolvedValue({ message: 'User test@example.com registered' });

      const result = await controller.register({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({ message: 'User test@example.com registered' });
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when user already exists', async () => {
      authService.register.mockRejectedValue(new UserAlreadyExistsException('User already exists'));

      await expect(controller.register({ email: 'test@example.com', password: 'password' })).rejects.toThrow(new ConflictException('User already exists'));
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.register).toHaveBeenCalledTimes(1);
    });

    it('should rethrow unknown errors', async () => {
      const unknownError = new Error('Unknown error');
      authService.register.mockRejectedValue(unknownError);

      await expect(controller.register({ email: 'test@example.com', password: 'password' })).rejects.toThrow(unknownError);
      expect(authService.register).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      authService.login.mockResolvedValue({ access_token: 'token123' });

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({ access_token: 'token123' });
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException if user credentials are invalid', async () => {
      authService.login.mockRejectedValue(new InvalidCredentialsException('Invalid credentials'));

      await expect(controller.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should rethrow unknown errors', async () => {
      const unknownError = new Error('Unknown error');
      authService.login.mockRejectedValue(unknownError);

      await expect(controller.login({ email: 'test@example.com', password: 'password' })).rejects.toThrow(unknownError);
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('validateToken', () => {
    it('should return isValid: true and user payload when token is valid', async () => {
      const token = 'valid.token.here';
      const userPayload = { sub: '123', email: 'test@example.com' };

      (authService.validateToken as jest.Mock).mockResolvedValue(userPayload);

      const result = await controller.validateToken(token);

      expect(result).toEqual({ isValid: true, user: userPayload });
      expect(authService.validateToken).toHaveBeenCalledWith(token);
      expect(authService.validateToken).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when the user is not found despite the token being valid', async () => {
      const token = 'valid.token.here';

      (authService.validateToken as jest.Mock).mockRejectedValue(new InvalidCredentialsException('Invalid credentials'));

      await expect(controller.validateToken(token)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
      expect(authService.validateToken).toHaveBeenCalledWith(token);
      expect(authService.validateToken).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException for other errors', async () => {
      const token = 'some.token';

      (authService.validateToken as jest.Mock).mockRejectedValue(new Error('Some other error'));

      await expect(controller.validateToken(token)).rejects.toThrow(new UnauthorizedException('Invalid token'));
      expect(authService.validateToken).toHaveBeenCalledWith(token);
      expect(authService.validateToken).toHaveBeenCalledTimes(1);
    });
  });
});
