import { ConfigService } from '@mocaverse/config-service';
import { ServerError } from '@mocaverse/core-interfaces';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import ShortUniqueId from 'short-unique-id';

type Config = {
  INITIAL_REMAINING_INVITE_CODE: number;
};

export class AuthService {
  private uid = new ShortUniqueId({ length: 8, dictionary: 'alphanum_upper' });
  constructor(
    private readonly configService: ConfigService,
    private db: PrismaClient,
    private config: Config
  ) {}

  private generateAccessToken(userId: number) {
    return jwt.sign(
      { userId, type: 'access' },
      this.configService.getEnv().JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );
  }

  private generateRefreshToken(userId: number) {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.configService.getEnv().JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );
  }

  private generateInviteCode() {
    return this.uid.randomUUID();
  }

  async loginWithEmail({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const emailProvider = await this.db.emailProvider.findUnique({
      where: { email },
      include: {
        provider: {
          select: { userId: true },
        },
      },
    });

    if (!emailProvider) {
      throw new ServerError('Invalid email or password', 401);
    }

    const isPasswordValid = await compare(password, emailProvider.password);
    if (!isPasswordValid) {
      throw new ServerError('Invalid password', 401);
    }

    if (!emailProvider.provider || !emailProvider.provider.userId) {
      throw new ServerError('User not found', 404);
    }

    const user = await this.db.user.findUnique({
      where: { id: emailProvider.provider.userId },
    });

    if (!user) {
      throw new ServerError('User not found', 404);
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
        where: { email },
      });

      if (emailProvider) {
        throw new ServerError('Email already exists', 409);
      }

      const code = await tx.inviteCode.findUnique({
        where: { code: inviteCode },
      });

      if (!code) {
        throw new ServerError('Invalid invite code', 400);
      }

      if (code.remaining <= 0) {
        throw new ServerError('Invite code already used', 400);
      }

      const newInviteCode = this.generateInviteCode();

      const user = await tx.user.create({
        data: {
          inviteCodeId: code.id,
          providers: {
            create: {
              type: 'EMAIL',
              EmailProvider: {
                create: {
                  email,
                  password,
                },
              },
            },
          },
          InviterToInvitee: {
            create: {
              code: newInviteCode,
              remaining: this.config.INITIAL_REMAINING_INVITE_CODE,
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
      ) as { userId: number; type: string };

      if (decoded.type !== 'refresh') {
        throw new ServerError('Invalid token type', 401);
      }

      const user = await this.db.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new ServerError('User not found', 404);
      }

      return {
        accessToken: this.generateAccessToken(user.id),
        refreshToken: this.generateRefreshToken(user.id),
      };
    } catch (error) {
      throw new ServerError('Invalid refresh token', 401);
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
