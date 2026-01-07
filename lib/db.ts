
import { createClient } from "@libsql/client";

// In Vite, we use import.meta.env to access variables.
// envPrefix in vite.config.ts allows NEXT_PUBLIC_ variables from Vercel to be seen here.

// Fix: Cast import.meta to any to resolve 'env' property not existing on type 'ImportMeta'
const url = ((import.meta as any).env.NEXT_PUBLIC_TURSO_DATABASE_URL as string) || ((import.meta as any).env.VITE_TURSO_DATABASE_URL as string);
// Fix: Cast import.meta to any to resolve 'env' property not existing on type 'ImportMeta'
const token = ((import.meta as any).env.NEXT_PUBLIC_TURSO_AUTH_TOKEN as string) || ((import.meta as any).env.VITE_TURSO_AUTH_TOKEN as string);

/**
 * Checks if the Turso database configuration is present.
 */
export const isDbConfigured = () => {
  const configured = !!url && url !== "" && !!token && token !== "";
  if (!configured) {
    console.warn("Database credentials missing. App running in local-only mode.");
  }
  return configured;
};

// Initialize the client. 
// We use a try-catch or safe defaults to prevent the entire JS bundle from failing to load.
export const db = createClient({
  url: url || "libsql://placeholder-for-build.turso.io",
  authToken: token || "placeholder-token",
});
