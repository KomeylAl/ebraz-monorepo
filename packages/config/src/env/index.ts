import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgresql://")),
});

const authEnvSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
});

const apiEnvSchema = z.object({
  API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

export const serverEnvSchema = baseEnvSchema.merge(authEnvSchema);
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function parseServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  return serverEnvSchema.parse(env);
}

export function parseClientEnv(env: Record<string, string | undefined>): ClientEnv {
  return clientEnvSchema.parse(env);
}

export function parseApiEnv(env: NodeJS.ProcessEnv = process.env) {
  return baseEnvSchema.merge(authEnvSchema).merge(apiEnvSchema).parse(env);
}
