import { createClient } from "@libsql/client";

/**
 * PRODUCTION DATABASE CONFIGURATION
 * These credentials allow the app to sync messages across all devices globally.
 */
const TURSO_DATABASE_URL: string = "libsql://mugiwara-chat-victorspear001.aws-ap-south-1.turso.io"; 
const TURSO_AUTH_TOKEN: string = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc3MTA1MTMsImlkIjoiN2RkYzM0NzEtYzIyYi00NDI0LWFjZDMtZDkxMmYzOTk5NTRmIiwicmlkIjoiN2FhMWYwOWEtNDYxMS00Yzk4LWIwMTQtM2YxMDY5YjM2YzRmIn0.qzsYfQKnDmsGnAhnWdvEEgIpXoXeqFCdpOQrj8M1KkFCMizepni-oKngxp7r7HVoh8kZIgVpiwwDXq7f-bK4Bg";

export const isDbConfigured = () => {
  return !!TURSO_DATABASE_URL && !!TURSO_AUTH_TOKEN && !TURSO_DATABASE_URL.includes("YOUR_");
};

export const db = createClient({
  url: TURSO_DATABASE_URL.trim(),
  authToken: TURSO_AUTH_TOKEN.trim(),
});