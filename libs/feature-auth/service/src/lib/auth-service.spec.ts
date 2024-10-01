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
    authService = new AuthService(mockConfigService, prismock, {
      INITIAL_REMAINING_INVITE_CODE: 10,
    });

    mockConfigService.getEnv.mockReturnValue({ JWT_SECRET: 'secret' });

    // Reset mocks before each test
    jest.resetAllMocks();
  });

  describe('loginWithEmail', () => {
    it('should return tokens on successful login', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockInviteCode = 'inviteCode123';

      await prismock.emailProvider.create({
        data: {
          email: mockEmail,
          password: 'hashedPassword',
          provider: {
            create: {
              type: 'EMAIL',
              User: {
                create: {
                  name: 'Test User',
                },
              },
              inviteCode: {
                create: {
                  code: mockInviteCode,
                  remaining: 10,
                  User: {
                    create: {
                      name: 'Test User',
                    },
                  },
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
          email: 'test@example.com',
          password: 'hashedPassword',
          provider: {
            create: {
              type: 'EMAIL',
              User: {
                create: {
                  name: 'Test User',
                },
              },
              inviteCode: {
                create: {
                  code: 'inviteCode123',
                  remaining: 10,
                  User: {
                    create: {
                      name: 'Test User',
                    },
                  },
                },
              },
            },
          },
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
  });

  describe('registerWithEmail', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');
      mockConfigService.getEnv.mockReturnValue({ JWT_SECRET: 'secret' });
    });

    it('should create a new user with a unique invite code', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockInviteCode = 'inviteCode123';

      await prismock.user.create({
        data: {
          name: 'Test User',
          InviteCode: {
            create: {
              code: mockInviteCode,
              remaining: 10,
            },
          },
        },
      });

      const result = await authService.registerWithEmail({
        email: mockEmail,
        password: mockPassword,
        inviteCode: mockInviteCode,
      });

      expect(result).toEqual({
        accessToken: 'mockToken',
        refreshToken: 'mockToken',
      });
    });

    it('should throw ServerError if invite code is invalid', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockInviteCode = 'invalidInviteCode';

      await expect(
        authService.registerWithEmail({
          email: mockEmail,
          password: mockPassword,
          inviteCode: mockInviteCode,
        })
      ).rejects.toThrow(new ServerError('Invalid invite code', 400));
    });

    it('should throw ServerError if invite code is already used', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';
      const mockInviteCode = 'usedInviteCode';

      await prismock.user.create({
        data: {
          name: 'Test User',
          InviteCode: {
            create: {
              code: mockInviteCode,
              remaining: 0,
            },
          },
        },
      });

      (jwt.sign as jest.Mock).mockReturnValue('mockToken');

      await expect(
        authService.registerWithEmail({
          email: mockEmail,
          password: mockPassword,
          inviteCode: mockInviteCode,
        })
      ).rejects.toThrow(new ServerError('Invite code already used', 400));
    });
  });

  afterEach(() => {
    prismock.$disconnect();
  });
});
