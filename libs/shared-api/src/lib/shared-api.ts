import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const s = initContract();

export const contract = s.router({
  auth: {
    loginWithEmail: {
      body: z.object({
        email: z.string(),
        password: z.string(),
      }),
      path: '/auth/login-with-email',
      method: 'POST',
      responses: {
        200: z.object({
          accessToken: z.string(),
          refreshToken: z.string(),
        }),
      },
    },
    registerWithEmail: {
      body: z.object({
        email: z.string(),
        password: z.string(),
        inviteCode: z.string(),
      }),
      path: '/auth/register-with-email',
      method: 'POST',
      responses: {
        200: z.object({
          accessToken: z.string(),
          refreshToken: z.string(),
        }),
      },
    },
    refresh: {
      body: z.object({
        refreshToken: z.string(),
      }),
      path: '/auth/refresh',
      method: 'POST',
      responses: {
        200: z.object({ accessToken: z.string() }),
      },
    },
    logout: {
      body: z.object({
        refreshToken: z.string(),
      }),
      path: '/auth/logout',
      method: 'POST',
      responses: { 200: z.object({}) },
    },
  },
});
