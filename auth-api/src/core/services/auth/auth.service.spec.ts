import { AuthRepository } from 'src/persistence/repositories/auth/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { ObjectId } from 'mongodb';
import { InvalidCredentialsException, UserAlreadyExistsException } from 'src/utils/custom-errors';
import { Test, TestingModule } from '@nestjs/testing';
import { JWT_SECRET_NAME } from 'src/utils/constants';

jest.mock('bcrypt');

describe('AuthService', () => {
  const jwtSecret = 'test-secret';

  let configService: jest.Mocked<ConfigService>;
  let repository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(jwtSecret),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            userExists: jest.fn(),
            findUserByEmail: jest.fn(),
            createUserCredentials: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    configService = module.get(ConfigService);
    repository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
    authService = module.get(AuthService);
  });

  describe('jwt secret', () => {
    it('should load JWT secret successfully from the config service', async () => {
      expect(authService['jwtSecret']).toEqual(jwtSecret);
      expect(configService.get).toHaveBeenCalledWith(JWT_SECRET_NAME);
      expect(configService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('should register a new user credentials', async () => {
      repository.userExists.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');

      const result = await authService.register('user@example.com', 'pass');
      expect(repository.createUserCredentials).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'hashed123',
      });
      expect(result).toEqual({ message: 'User user@example.com registered' });
    });

    it('should throw an error if user credentials already exist', async () => {
      repository.userExists.mockResolvedValue(true);
      await expect(authService.register('user@example.com', 'pass')).rejects.toThrow(new UserAlreadyExistsException('User already exists'));
    });
  });

  describe('login', () => {
    it('should return a JWT if user credentials are valid', async () => {
      repository.findUserByEmail.mockResolvedValue({
        _id: new ObjectId(),
        email: 'user@example.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await authService.login('user@example.com', 'pass');
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw an error if user credentials are invalid', async () => {
      repository.findUserByEmail.mockResolvedValue(null);

      await expect(authService.login('user@example.com', 'some password')).rejects.toThrow(new InvalidCredentialsException('Invalid credentials'));
    });

    it('should throw an error if user password is incorrect', async () => {
      repository.findUserByEmail.mockResolvedValue({
        _id: new ObjectId(),
        email: 'user@example.com',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('user@example.com', 'wrong')).rejects.toThrow(new InvalidCredentialsException('Invalid credentials'));
    });
  });

  describe('validateToken', () => {
    it('should return the user jwt payload when the token is valid and the user exists', async () => {
      const token = 'valid.token.here';
      const userJwtPayload = { sub: '123', email: 'test@example.com' };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(userJwtPayload);
      (repository.findUserByEmail as jest.Mock).mockResolvedValue({
        _id: 'someId',
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      const result = await authService.validateToken(token);
      expect(result).toEqual(userJwtPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: jwtSecret });
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(repository.findUserByEmail).toHaveBeenCalledWith(userJwtPayload.email);
      expect(repository.findUserByEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw InvalidCredentialsException if user is not found', async () => {
      const token = 'valid.token.here';
      const userJwtPayload = { sub: '123', email: 'test@example.com' };

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(userJwtPayload);
      (repository.findUserByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.validateToken(token)).rejects.toThrow(new InvalidCredentialsException('Invalid credentials'));
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: jwtSecret });
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(repository.findUserByEmail).toHaveBeenCalledWith(userJwtPayload.email);
      expect(repository.findUserByEmail).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when the token is invalid', async () => {
      const token = 'invalid.token';

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(authService.validateToken(token)).rejects.toThrow('Invalid token');
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: jwtSecret });
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(repository.findUserByEmail).toHaveBeenCalledTimes(0);
    });
  });
});
