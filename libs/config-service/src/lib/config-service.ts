import { z } from 'zod';

const ConfigSchema = z.object({
  JWT_SECRET: z.string(),
});

export class ConfigService {
  private readonly config: z.infer<typeof ConfigSchema>;

  constructor() {
    this.config = ConfigSchema.parse(process.env);
  }

  getEnv() {
    return this.config;
  }
}
