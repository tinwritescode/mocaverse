import { ConfigService } from '@mocaverse/config-service';
import { ServerError } from '@mocaverse/core-interfaces';
import { PrismockClient } from 'prismock';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth-service';
import { DefaultArgs } from '.prisma/client/runtime/library';
import { PrismaClient, Prisma } from '@prisma/client';

// Mock dependencies
jest.mock('@mocaverse/config-service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let prismock: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

  beforeEach(() => {
    mockConfigService = {
      getEnv: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    prismock = new PrismockClient();
    authService = new AuthService(mockConfigService, prismock);

    // Reset mocks before each test
    jest.resetAllMocks();
  });

  describe('loginWithEmail', () => {
    it('should return tokens on successful login', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockUserId = 'user123';
      const mockInviteCode = 'inviteCode123';

      await prismock.emailProvider.create({
        data: {
          id: 'provider123',
          email: mockEmail,
          password: 'hashedPassword',
          provider: {
            create: {
              type: 'EMAIL',
              User: {
                create: {
                  id: mockUserId,
                  name: 'Test User',
                },
              },
              inviteCode: {
                create: {
                  code: mockInviteCode,
                  remaining: 10,
                },
              },
            },
          },
        },
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      mockConfigService.getEnv.mockReturnValue({ JWT_SECRET: 'secret' });

      const result = await authService.loginWithEmail({
        email: mockEmail,
        password: mockPassword,
      });

      expect(result).toEqual({
        accessToken: 'mockToken',
        refreshToken: 'mockToken',
      });
    });

    it('should throw ServerError if email is not found', async () => {
      await expect(
        authService.loginWithEmail({
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow(new ServerError('Invalid email or password', 401));
    });

    it('should throw ServerError if password is incorrect', async () => {
      await prismock.emailProvider.create({
        data: {
          id: 'provider123',
          email: 'test@example.com',
          password: 'hashedPassword',
          providerId: 'provider123',
        },
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginWithEmail({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(new ServerError('Invalid password', 401));
    });

    it('should throw ServerError if user is not found', async () => {
      await prismock.emailProvider.create({
        data: {
          id: 'provider123',
          email: 'test@example.com',
          password: 'hashedPassword',
          providerId: 'provider123',
        },
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.loginWithEmail({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow(new ServerError('User not found', 404));
    });
  });

  afterEach(() => {
    prismock.$disconnect();
  });
});
