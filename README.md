# Mugiwara Chat - No-Code Setup Guide

## 1. Turso Database Setup (Web Dashboard Method)

Since you are not using the command line, we will use the Turso website.

### Step 1: Create Database
1. Go to [app.turso.tech](https://app.turso.tech) and Sign Up/Log In.
2. Click the **"Create Database"** button.
3. Name your database: `mugiwara-chat`.
4. Select a region closest to you.
5. Click **"Create Database"**.

### Step 2: Get Connection Variables
Once the database is created, you will be on the database overview page.
1. Look for the **"Connect"** button or the "Database URL" section.
2. Copy the **Database URL**. It looks like: `libsql://mugiwara-chat-yourusername.turso.io`.
3. Click on the **"Generate Token"** button (or look for "Auth Token"). Copy the **Auth Token**.
4. Save these for Step 3.

### Step 3: Create the Table (SQL Editor)
1. On the Turso Dashboard, click on your database.
2. Click on the **"Editor"** tab (sometimes called "Console" or "SQL").
3. Paste the following code into the SQL editor and click **"Run"**:

```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL,
    text TEXT NOT NULL,
    sender TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    status TEXT DEFAULT 'sent'
);
```

---

## 2. Connect Your App (Environment Variables)

### If deploying to Vercel (Recommended):
1. Go to your Project Settings in Vercel.
2. Go to **"Environment Variables"**.
3. Add the following two variables using the data you copied in Step 2:
   - Key: `NEXT_PUBLIC_TURSO_DATABASE_URL` 
     - Value: `libsql://...`
   - Key: `NEXT_PUBLIC_TURSO_AUTH_TOKEN`
     - Value: `ey...` (your long token)

### If running locally:
Create a file named `.env.local` in your project folder:
```env
NEXT_PUBLIC_TURSO_DATABASE_URL=libsql://mugiwara-chat-yourusername.turso.io
NEXT_PUBLIC_TURSO_AUTH_TOKEN=your-long-token-here
```

---

## 3. Deployment

1. **Push to GitHub:**
   - Upload your code to a GitHub repository.
2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com).
   - Click **"Add New Project"**.
   - Select your GitHub repository.
   - **Important:** Ensure the Environment Variables from Step 2 are added during the import step or in settings after deploying.
   - Click **Deploy**.

The app will now automatically detect your Turso credentials and start saving messages to the cloud instead of your browser's local storage.
