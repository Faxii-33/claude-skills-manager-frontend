# Claude Skills Manager — Frontend

A dark-themed web dashboard for managing your team's Claude MCP skills. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Dashboard** — Overview of all skills, usage stats, and recent activity
- **Editor** — Create and edit skills with a markdown editor and live preview
- **Team** — Manage team members and roles (admin/user)
- **Settings** — Profile settings and MCP connection config for sharing

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-migration.sql`
3. Go to **Authentication** → **Users** → **Add User** to create your first admin
4. Copy the user's UUID and run:
   ```sql
   INSERT INTO profiles (id, email, display_name, role)
   VALUES ('YOUR-UUID', 'you@email.com', 'Your Name', 'admin');
   ```
5. Copy your **Project URL** and **anon key** from **Settings** → **API**

### 2. Local Development

```bash
npm install

# Create .env.local
cp .env.example .env.local
# Fill in your Supabase URL and anon key

npm run dev
```

### 3. Deploy to Railway

1. Push this repo to GitHub
2. Create a new service in Railway from the repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MCP_SERVER_URL` (your existing MCP server URL)
4. Railway will auto-detect the Dockerfile and deploy

## Architecture

```
Railway: MCP Server (Python)     ← Claude Desktop connects here
Railway: This Frontend (Next.js) ← Team members use this in browser
Supabase: PostgreSQL             ← Skills data (shared by both)
Supabase: Auth                   ← Login and user management
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (dark theme)
- **Supabase** (auth + database)
- **Lucide React** (icons)
- **React Markdown** (preview)
