import { AuthService } from '@mocaverse/auth-service';
import { ConfigService } from '@mocaverse/config-service';
import { db } from '@mocaverse/mocaverse-prisma-client';
import { contract } from '@mocaverse/shared-api';
import { initServer } from '@ts-rest/express';
import { RouterImplementation } from '@ts-rest/express/src/lib/types';

const s = initServer();

const configService = new ConfigService();
const authService = new AuthService(configService, db);

export const authHandler: RouterImplementation<typeof contract.auth> = s.router(
  contract.auth,
  {
    loginWithEmail: async ({ body }) => {
      const { email, password } = body;

      const { accessToken, refreshToken } = await authService.loginWithEmail({
        email,
        password,
      });

      return {
        status: 200,
        body: {
          accessToken,
          refreshToken,
        },
      };
    },
    registerWithEmail: async ({ body }) => {
      const { email, password, inviteCode } = body;
      const { accessToken, refreshToken } = await authService.registerWithEmail(
        {
          email,
          password,
          inviteCode,
        }
      );

      return {
        status: 200,
        body: {
          accessToken,
          refreshToken,
        },
      };
    },
    logout: async ({ body }) => {
      const { refreshToken } = body;
      await authService.logout({ refreshToken });
      return { status: 200, body: {} };
    },
    refresh: {
      middleware: [],
      handler: async ({ body }) => {
        const { refreshToken } = body;
        const { accessToken, refreshToken: newRefreshToken } =
          await authService.refresh({
            refreshToken,
          });

        return {
          status: 200,
          body: {
            accessToken,
            refreshToken: newRefreshToken,
          },
        };
      },
    },
  }
);
