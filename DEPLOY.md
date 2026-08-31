# Deploying Islamic Digital Library

## Why login failed on some laptops

The app uses **Supabase Auth** when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set (local `.env` or Netlify/Vercel env vars).

If the admin user was **never created in Supabase**, every device with env vars configured shows **"Invalid login credentials"** — even with the correct password.

Laptops **without** `.env` used a local fallback and could still log in. That caused inconsistent behavior across the team.

## Fix (one time, project owner)

### Option A — Supabase Dashboard (recommended)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **Authentication → Users → Add user → Create new user**
3. Email: `admin@islamicdigitallibrary.com`
4. Password: `Admin@12345`
5. Check **Auto Confirm User**
6. Save

### Option B — SQL Editor

Run `supabase/auth.sql` in **SQL Editor** (after `supabase/schema.sql`).

### Option C — CLI script (needs valid service role key)

```bash
cp .env.example .env   # fill in keys from Supabase → Settings → API
npm run setup:admin
```

If you see `Invalid API key`, regenerate keys in Supabase **Settings → API** and update `.env`.

---

## Environment variables (every laptop + deploy)

Copy `.env.example` to `.env` locally. **Use the same Supabase project** on all machines.

| Variable | Where | Required |
|----------|--------|----------|
| `VITE_SUPABASE_URL` | `.env`, Netlify, Vercel | Yes |
| `VITE_SUPABASE_ANON_KEY` | `.env`, Netlify, Vercel | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env` only (never in browser) | For `setup:admin` only |

Vite **inlines** `VITE_*` at **build time** — change env vars → **redeploy**.

---

## Netlify

1. Site settings → **Environment variables** → add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
2. Trigger **Deploy** (clear cache if needed)
3. Create admin user in Supabase (steps above)

`netlify.toml` is already configured for SPA routing.

---

## Vercel

1. Project → **Settings → Environment Variables** → same two `VITE_*` vars
2. Redeploy
3. Create admin user in Supabase

`vercel.json` handles SPA rewrites.

---

## Login credentials (team)

- **Email:** `admin@islamicdigitallibrary.com`
- **Password:** `Admin@12345`

After the code update, these credentials also work as a **local session fallback** when Supabase is configured but the admin user is missing — so the team can reach the admin panel. **Book save/upload still requires a real Supabase login**; complete Option A above for full backend access.
