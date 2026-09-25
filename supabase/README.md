# Supabase Database & Storage Setup Guide

Follow these simple steps to configure your Supabase backend for **Prompt2Poster**.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, select an organization, and provide a name (e.g. `Prompt2Poster-DB`).
3. Set a strong database password and select your region.
4. Click **Create new project**.

---

## 2. Execute SQL Schema

1. Open your Supabase Dashboard.
2. Click on **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Copy the entire content of [`supabase/schema.sql`](file:///C:/Users/HP/.gemini/antigravity/scratch/Prompt2Poster/supabase/schema.sql) and paste it into the editor.
5. Click **Run** to create the `topics` table, `submissions` table, indexes, and initial active topic.

---

## 3. Configure Supabase Storage Bucket

1. In the Supabase Dashboard, click on **Storage** in the left sidebar.
2. Click **New Bucket**.
3. Set Bucket Name to: `posters`
4. Toggle **Public Bucket** to **ON** (so poster images are publicly accessible for the leaderboard).
5. Click **Save**.

---

## 4. Retrieve API Credentials

1. Go to **Project Settings** -> **API**.
2. Copy your **Project URL** (e.g., `https://xyzcompany.supabase.co`).
3. Copy your **`anon` `public` key**.
4. Open `.env` in the root of `Prompt2Poster/` and set:

```env
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```
