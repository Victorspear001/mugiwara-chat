import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN;

export const db = createClient({
  url: TURSO_DATABASE_URL || "file:local.db",
  authToken: TURSO_AUTH_TOKEN,
});

// Helper to check if DB is configured
export const isDbConfigured = () => {
  return !!TURSO_DATABASE_URL && !!TURSO_AUTH_TOKEN;
};