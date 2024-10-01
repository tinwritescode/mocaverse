import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string(),
  VITE_ALCHEMY_ID: z.string(),
  VITE_WALLETCONNECT_PROJECT_ID: z.string(),
});

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_ALCHEMY_ID: import.meta.env.VITE_ALCHEMY_ID,
  VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
});
