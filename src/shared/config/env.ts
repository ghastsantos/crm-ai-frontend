import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL deve ser uma URL válida (ex.: http://localhost:3000)'),
  VITE_AUTH_HTTPONLY_COOKIE: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v === '') return false;
      return v !== 'false' && v !== '0';
    }),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_AUTH_HTTPONLY_COOKIE: import.meta.env.VITE_AUTH_HTTPONLY_COOKIE,
});
