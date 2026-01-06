import { createClient } from "@libsql/client";

// In Vite, we strictly use import.meta.env.
// The vite.config.ts ensures NEXT_PUBLIC_ variables are accessible here.
// We avoid process.env entirely as it can cause "process is not defined" errors in some browser contexts.

const url = (import.meta.env.NEXT_PUBLIC_TURSO_DATABASE_URL as string) || (import.meta.env.VITE_TURSO_DATABASE_URL as string);
const token = (import.meta.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN as string) || (import.meta.env.VITE_TURSO_AUTH_TOKEN as string);

export const isDbConfigured = () => {
  return !!url && !!token;
};

// Initialize the client.
// We use placeholders if config is missing to prevent immediate crash during the initial bundle load.
// The app logic checks isDbConfigured() before making actual calls.
export const db = createClient({
  url: url || "libsql://placeholder.turso.io",
  authToken: token || "placeholder-token",
});