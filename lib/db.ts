import { createClient } from "@libsql/client";

/**
 * DATABASE CONFIGURATION
 * These credentials are used for persistent, multi-device chat syncing.
 */
const TURSO_DATABASE_URL: string = "libsql://mugiwara-chat-victorspear001.aws-ap-south-1.turso.io"; 
const TURSO_AUTH_TOKEN: string = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3MTA1MTMsImlkIjoiN2RkYzM0NzEtYzIyYi00NDI0LWFjZDMtZDkxMmYzOTk5NTRmIiwicmlkIjoiN2FhMWYwOWEtNDYxMS00Yzk4LWIwMTQtM2YxMDY5YjM2YzRmIn0.qzsYfQKnDmsGnAhnWdvEEgIpXoXeqFCdpOQrj8M1KkFCMizepni-oKngxp7r7HVoh8kZIgVpiwwDXq7f-bK4Bg";

/**
 * Validates the database configuration.
 */
export const isDbConfigured = () => {
  const urlValid = !!TURSO_DATABASE_URL && !TURSO_DATABASE_URL.includes("YOUR_");
  const tokenValid = !!TURSO_AUTH_TOKEN && !TURSO_AUTH_TOKEN.includes("YOUR_");
  
  if (!urlValid || !tokenValid) {
    console.warn("Database configuration incomplete. Persistence disabled.");
    return false;
  }
  return true;
};

// Initialize the Turso client
export const db = createClient({
  url: isDbConfigured() ? TURSO_DATABASE_URL.trim() : "libsql://placeholder.turso.io",
  authToken: isDbConfigured() ? TURSO_AUTH_TOKEN.trim() : "placeholder-token",
});