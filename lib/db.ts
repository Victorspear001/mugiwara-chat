import { createClient } from "@libsql/client";

// Safely access environment variables in various environments (Vite, Next.js, Standard Browser)
const getEnv = (key: string): string | undefined => {
  try {
    // Check process.env (Node/Next.js/Webpack)
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key];
      return typeof val === 'string' ? val : undefined;
    }
    // Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env[key];
      return typeof val === 'string' ? val : undefined;
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
};

const TURSO_DATABASE_URL = getEnv('NEXT_PUBLIC_TURSO_DATABASE_URL');
const TURSO_AUTH_TOKEN = getEnv('NEXT_PUBLIC_TURSO_AUTH_TOKEN');

export const isDbConfigured = () => {
  return !!TURSO_DATABASE_URL && !!TURSO_AUTH_TOKEN;
};

// Initialize the client safely.
// If config is missing, we use a placeholder URL to prevent the client from crashing on init.
// The app checks isDbConfigured() before actually using this client.
export const db = createClient({
  url: TURSO_DATABASE_URL || "libsql://placeholder-db.turso.io",
  authToken: TURSO_AUTH_TOKEN || "placeholder-token",
});