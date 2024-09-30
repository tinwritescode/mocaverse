import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@mocaverse/config-service';
import { PrismaClient } from '@prisma/client';

export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private db: PrismaClient
  ) {}

  private generateAccessToken(userId: string) {
    return jwt.sign(
      { userId, type: 'access' },
      this.configService.getEnv().JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );
  }

  private generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.configService.getEnv().JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );
  }

  async loginWithEmail({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const emailProvider = await this.db.emailProvider.findUnique({
      where: {
        email,
      },
      include: {
        provider: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!emailProvider) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await compare(password, emailProvider.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const user = await this.db.user.findUnique({
      where: {
        id: emailProvider.provider.userId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken: this.generateRefreshToken(user.id),
    };
  }

  async registerWithEmail({
    email,
    password,
    inviteCode,
  }: {
    email: string;
    password: string;
    inviteCode: string;
  }) {
    const userId = await this.db.$transaction(async (tx) => {
      const emailProvider = await tx.emailProvider.findUnique({
        where: {
          email,
        },
      });

      if (emailProvider) {
        throw new Error('Email already exists');
      }

      const inviteCodeId = await tx.inviteCode
        .findUnique({
          where: {
            code: inviteCode,
          },
        })
        .then((inviteCode) => inviteCode?.id);

      if (!inviteCodeId) {
        throw new Error('Invalid invite code');
      }

      const user = await tx.user.create({
        data: {
          providers: {
            create: {
              type: 'EMAIL',
              inviteCodeId,
              EmailProvider: {
                create: {
                  email,
                  password,
                },
              },
            },
          },
        },
      });

      return user.id;
    });

    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  async refresh({ refreshToken }: { refreshToken: string }) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.configService.getEnv().JWT_SECRET
      ) as { userId: string; type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await this.db.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        accessToken: this.generateAccessToken(user.id),
        refreshToken: this.generateRefreshToken(user.id),
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout({ refreshToken }: { refreshToken: string }) {
    await this.db.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });
  }
}
