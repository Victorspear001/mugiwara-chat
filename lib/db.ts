
import { createClient } from "@libsql/client";

/**
 * HARDCODED DATABASE CREDENTIALS
 * Paste your Turso values directly below.
 */
// Added explicit string typing to prevent narrowing to 'never' literal type
const TURSO_DATABASE_URL: string = " libsql://mugiwara-chat-victorspear001.aws-ap-south-1.turso.io"; 
// Added explicit string typing to prevent narrowing to 'never' literal type
const TURSO_AUTH_TOKEN: string = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3MTA1MTMsImlkIjoiN2RkYzM0NzEtYzIyYi00NDI0LWFjZDMtZDkxMmYzOTk5NTRmIiwicmlkIjoiN2FhMWYwOWEtNDYxMS00Yzk4LWIwMTQtM2YxMDY5YjM2YzRmIn0.qzsYfQKnDmsGnAhnWdvEEgIpXoXeqFCdpOQrj8M1KkFCMizepni-oKngxp7r7HVoh8kZIgVpiwwDXq7f-bK4Bg";

/**
 * Checks if the Turso database configuration is present.
 */
export const isDbConfigured = () => {
  const configured = 
    !!TURSO_DATABASE_URL && 
    TURSO_DATABASE_URL !== "" && 
    !TURSO_DATABASE_URL.includes("YOUR_") &&
    !!TURSO_AUTH_TOKEN && 
    TURSO_AUTH_TOKEN !== "" &&
    !TURSO_AUTH_TOKEN.includes("YOUR_");

  if (!configured) {
    console.warn("Turso credentials not found in lib/db.ts. App running in local-only mode.");
  }
  return configured;
};

// Initialize the client.
// We use placeholders if config is missing to prevent immediate crash.
export const db = createClient({
  url: isDbConfigured() ? TURSO_DATABASE_URL : "libsql://placeholder.turso.io",
  authToken: isDbConfigured() ? TURSO_AUTH_TOKEN : "placeholder-token",
});
