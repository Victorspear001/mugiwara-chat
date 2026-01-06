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

## 2. Connect Your App

1. In Vercel (or `.env.local`), add:
   - `NEXT_PUBLIC_TURSO_DATABASE_URL`
   - `NEXT_PUBLIC_TURSO_AUTH_TOKEN`

## 3. How to Use
1. Open the app.
2. Login with a **Phone Number** (e.g., "123") and **Name**.
3. To chat with someone else, they must also login once to register.
4. Click the **New Chat Icon** (Message bubble) in the sidebar.
5. Enter their phone number to start chatting.
