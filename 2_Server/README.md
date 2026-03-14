# Viral Post Finder — Server + Admin Dashboard

## What this is
- FastAPI backend (license verify API + admin API)
- Next.js admin dashboard (built as static export, served by FastAPI)
- Everything runs as ONE service on Render free tier

## Deploy to Render (Free)

### Step 1 — Supabase setup
Run this SQL in your Supabase project:

```sql
CREATE TABLE licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  license_key TEXT UNIQUE NOT NULL,
  extension_id TEXT DEFAULT 'ext_viral_post_finder',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen TIMESTAMPTZ,
  device_fingerprint TEXT,
  notes TEXT
);

CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL,
  user_name TEXT,
  device_fingerprint TEXT,
  extension_id TEXT,
  service_url TEXT,
  browser_info TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);
```

### Step 2 — Push to GitHub
Push this folder to a GitHub repo.

### Step 3 — Create Render Web Service
1. Go to render.com → New → Web Service
2. Connect your GitHub repo
3. Set these environment variables:
   - SUPABASE_URL = your supabase project URL
   - SUPABASE_SERVICE_KEY = your supabase service role key
   - ADMIN_SECRET = any strong password you choose
   - NEXT_PUBLIC_ADMIN_SECRET = same as ADMIN_SECRET
4. Build Command: bash build.sh
5. Start Command: bash start.sh
6. Click Deploy

### Step 4 — Update extension
In background.js and popup.js, replace:
  const API_BASE = "https://YOUR-SERVER-URL.com";
with your actual Render URL, e.g.:
  const API_BASE = "https://viral-post-finder-server.onrender.com";

### Step 5 — Access admin dashboard
Open your Render URL in browser → you'll see the admin dashboard.
