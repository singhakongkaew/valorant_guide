# V/GUIDE

## Deploy on Vercel

This repository is configured for Vercel's Express deployment: the root `index.js` exposes the Express app, and the Vite client builds into the root `public` directory for static delivery.

1. Import this repository into Vercel and keep the project root set to the repository root.
2. Create a MongoDB Atlas database and allow connections from Vercel in Atlas Network Access. Copy the database connection string.
3. Create a Vercel Blob store and copy its read/write token.
4. Add these project environment variables for Production and Preview:
   - `MONGO_URI`: MongoDB Atlas connection string, including the database name.
   - `JWT_SECRET`: a private random value of at least 32 characters.
   - `ADMIN_EMAIL`: email address that should receive the first-admin role when registering.
   - `BLOB_READ_WRITE_TOKEN`: read/write token for the Vercel Blob store.
   - `VITE_API_URL`: `/api` (the same-origin Vercel API).
5. Deploy. Vercel detects the root Express entry point, serves built files from `public`, and routes API requests through Express. Non-API page paths are rewritten to the Vite `index.html` for client-side routing.

Images upload from the browser directly to Vercel Blob using short-lived client upload tokens issued after authentication. Each image is limited to JPG, PNG, or WebP and 5 MB; the server stores Blob URLs in MongoDB Atlas.

For local development, set `MONGO_URI`, `JWT_SECRET`, and `BLOB_READ_WRITE_TOKEN` in `server/.env`. The Vite dev server proxies `/api` to the local Express server.
