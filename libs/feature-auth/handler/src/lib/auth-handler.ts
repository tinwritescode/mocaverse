import { AuthService } from '@mocaverse/auth-service';
import { ServerError } from '@mocaverse/core-interfaces';
import { contract } from '@mocaverse/shared-api';
import { initServer } from '@ts-rest/express';
import { RouterImplementation } from '@ts-rest/express/src/lib/types';

const s = initServer();

type AuthHandler = RouterImplementation<typeof contract.auth>;

export const authHandler: (authService: AuthService) => AuthHandler = (
  authService
) =>
  s.router(contract.auth, {
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
        if (error instanceof ServerError) {
          return {
            status: 400,
            body: {
              error: error.message,
            },
          };
        }

        console.error(error);
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
        if (error instanceof ServerError) {
          return {
            status: 400,
            body: {
              error: error.message,
            },
          };
        }

        console.error(error);
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
      try {
        await authService.logout({ refreshToken });
        return { status: 200, body: {} };
      } catch (error) {
        console.error(error);
        return {
          status: 500,
          body: {
            error: 'Internal server error',
          },
        };
      }
    },
    refresh: async ({ body }) => {
      const { refreshToken } = body;
      try {
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
      } catch (error) {
        if (error instanceof ServerError) {
          return {
            status: 400,
            body: {
              error: error.message,
            },
          };
        }

        console.error(error);
        return {
          status: 500,
          body: {
            error: 'Internal server error',
          },
        };
      }
    },
  });
