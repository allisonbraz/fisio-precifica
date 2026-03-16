const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  console.warn(`[ENV] Missing ${name} — using empty fallback (dev mode)`);
  return "";
}

export const ENV = {
  appId: requireEnv("VITE_APP_ID", ""),
  cookieSecret: requireEnv("JWT_SECRET"),
  databaseUrl: requireEnv("DATABASE_URL"),
  oAuthServerUrl: requireEnv("OAUTH_SERVER_URL", ""),
  ownerOpenId: requireEnv("OWNER_OPEN_ID", ""),
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
