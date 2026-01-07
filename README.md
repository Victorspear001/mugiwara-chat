# Mugiwara Chat

A real-time chat application powered by Turso DB and React.

## 🚀 How to Make it Public (Available to the World)

To use this app on any device (iPhone, Android, Laptop) without running it locally, you must deploy it.

### Option 1: Vercel (Recommended)
1.  Push this code to a **GitHub** repository.
2.  Go to [Vercel.com](https://vercel.com) and Sign Up.
3.  Click **"Add New..."** -> **"Project"**.
4.  Select your `mugiwara-chat` repository.
5.  Click **Deploy**.
6.  Once finished, Vercel will give you a domain like `https://mugiwara-chat.vercel.app`. Share this link with anyone!

### Option 2: Local Network (Wi-Fi only)
If you just want to test on your phone at home:
1.  Run `npm run dev` in your terminal.
2.  Look for the "Network" URL in the terminal (e.g., `http://192.168.1.5:5173`).
3.  Type that URL into your phone's browser while connected to the same Wi-Fi.

## Database Setup (Already Configured)
The database credentials are currently embedded in `lib/db.ts` for ease of use. 
The app connects to a Turso database instance hosted in the cloud.

## Features
-   Real-time messaging (Polling)
-   Global Sync (Database backed)
-   One Piece themed UI
-   Mobile Responsive