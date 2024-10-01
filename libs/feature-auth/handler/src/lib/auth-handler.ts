import { AuthService } from '@mocaverse/auth-service';
import { ConfigService } from '@mocaverse/config-service';
import { db } from '@mocaverse/mocaverse-prisma-client';
import { contract } from '@mocaverse/shared-api';
import { initServer } from '@ts-rest/express';
import { RouterImplementation } from '@ts-rest/express/src/lib/types';
import { ServerError } from '@mocaverse/core-interfaces';

const s = initServer();

const configService = new ConfigService();
const authService = new AuthService(configService, db);

export const authHandler: RouterImplementation<typeof contract.auth> = s.router(
  contract.auth,
  {
    loginWithEmail: async ({ body }) => {
      const { email, password } = body;

      try {
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
      } catch (error) {
        console.error(error);
        if (error instanceof ServerError) {
          return {
            status: 400,
            body: {
              error: error.message,
            },
          };
        }

        return {
          status: 500,
          body: {
            error: 'Internal server error',
          },
        };
      }
    },
    registerWithEmail: async ({ body }) => {
      const { email, password, inviteCode } = body;

      try {
        const { accessToken, refreshToken } =
          await authService.registerWithEmail({
            email,
            password,
            inviteCode,
          });

        return {
          status: 200,
          body: {
            accessToken,
            refreshToken,
          },
        };
      } catch (error) {
        console.error(error);
        if (error instanceof ServerError) {
          return {
            status: 400,
            body: {
              error: error.message,
            },
          };
        }

        return {
          status: 500,
          body: {
            error: 'Internal server error',
          },
        };
      }
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
