# Mugiwara Chat - Setup Guide

## 1. Turso Database Setup

### Step 1: Create Database
1. Go to [app.turso.tech](https://app.turso.tech).
2. Create database named `mugiwara-chat`.

### Step 2: Get Credentials
1. Copy **Database URL** and **Auth Token**.

### Step 3: Run SQL (CRITICAL)
Go to the **SQL/Editor** tab in Turso and run this to enable multi-user chat:

```sql
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    phone TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    about TEXT DEFAULT 'Hey there! I am using Mugiwara Chat.'
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    sender_phone TEXT NOT NULL,
    receiver_phone TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    status TEXT DEFAULT 'sent'
);
```

---

## 2. Deployment to Vercel (Critical for Cross-Device Support)

This app uses Vite. When deploying to Vercel, you must ensure the Environment Variables are available to the browser.

1.  Push your code to GitHub.
2.  Import project into Vercel.
3.  **In Vercel Project Settings > Environment Variables:**
    Add the following keys (using the values from Turso):

    -   `NEXT_PUBLIC_TURSO_DATABASE_URL`
    -   `NEXT_PUBLIC_TURSO_AUTH_TOKEN`

    *(Note: We use the `NEXT_PUBLIC_` prefix, and the included `vite.config.ts` ensures these are loaded correctly).*

4.  **Redeploy** if you added these variables after the initial deployment.

## 3. How to Use
1.  Open the app on any device.
2.  Login with a **Phone Number** (e.g., "555-001") and **Name**.
3.  On a **second device**, login with a **different** Phone Number (e.g., "555-002").
4.  On device 1, click the **New Chat Icon** (Message bubble).
5.  Enter "555-002" to start chatting with the second device.
