import { createClient } from "@libsql/client";

// Helper to reliably get Env Vars in Vite/Vercel.
// We access properties directly so the bundler (Vite) can statically replace them with the actual values during build.
const getEnvConfig = () => {
  let url = "";
  let token = "";

  // 1. Try Vite's import.meta.env
  try {
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // @ts-ignore
      url = import.meta.env.NEXT_PUBLIC_TURSO_DATABASE_URL || import.meta.env.VITE_TURSO_DATABASE_URL;
      // @ts-ignore
      token = import.meta.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || import.meta.env.VITE_TURSO_AUTH_TOKEN;
    }
  } catch (e) {}

  // 2. Fallback to process.env (for compatibility or some Vercel build steps)
  if (!url || !token) {
    try {
      // @ts-ignore
      if (typeof process !== "undefined" && process.env) {
        // @ts-ignore
        url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
        // @ts-ignore
        token = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;
      }
    } catch (e) {}
  }

  return { url, token };
};

const { url, token } = getEnvConfig();

export const isDbConfigured = () => {
  return !!url && !!token;
};

// Initialize the client.
// We use placeholders if config is missing to prevent immediate crash, 
// but isDbConfigured() will return false, preventing actual queries.
export const db = createClient({
  url: url || "libsql://placeholder.turso.io",
  authToken: token || "placeholder-token",
});