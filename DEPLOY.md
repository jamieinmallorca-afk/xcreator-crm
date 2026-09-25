# Deploy + Custom Domain — Item 12

## 1. Add new environment variables to Vercel

Go to **Vercel → xcreator-crm → Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `CRON_SECRET` | generate a random string, e.g. `openssl rand -hex 32` |
| `X_OAUTH_SCOPES` | (informational — already set in code) |

The cron jobs in `vercel.json` call `/api/cron/sync-subscribers` and `/api/cron/winback` at 06:00 and 09:00 UTC daily. They check the `Authorization: Bearer <CRON_SECRET>` header.

## 2. Run database migrations

Open **Supabase → SQL Editor** and run these files in order:

1. `supabase/onboarding-migration.sql`
2. `supabase/winback-migration.sql`

## 3. Update X app permissions for DM scope

The win-back DM feature needs `dm.read` and `dm.write` scopes.

1. Go to [developer.twitter.com/en/portal/projects](https://developer.twitter.com/en/portal/projects)
2. Open your app → **User authentication settings**
3. Under **OAuth 2.0 scopes**, make sure **Direct Messages (Read & Write)** is enabled
4. Save

> **Important:** Existing users won't have the DM scope yet. The dashboard shows them a notice with a "reconnect" link (`/api/auth/x`) which re-runs the OAuth flow with the new scopes.

## 4. Point a custom domain

### In Vercel:
1. Go to **Settings → Domains**
2. Click **Add domain** → enter your domain (e.g. `app.xcreator.io`)
3. Vercel shows you DNS records to add

### In your DNS provider (e.g. Namecheap, Cloudflare):
- **CNAME record:** `app` → `cname.vercel-dns.com`  
  *or* if pointing the apex (`xcreator.io`):
- **A record:** `@` → `76.76.21.21`
- **CNAME record:** `www` → `cname.vercel-dns.com`

### Update `NEXT_PUBLIC_APP_URL`:
Change it from `https://xcreator-crm-vzwk.vercel.app` to `https://app.xcreator.io` (your domain) in Vercel env vars.

Also update the **X app redirect URI** in the Twitter Developer Portal:
- Remove: `https://xcreator-crm-vzwk.vercel.app/api/auth/callback/x`
- Add: `https://app.xcreator.io/api/auth/callback/x`

> You can keep both URIs active during transition.

## 5. Trigger a redeployment

After adding the env vars and running migrations, push any small change or use **Vercel → Deployments → Redeploy** to pick up the new env vars.

## 6. Verify

- [ ] Visit your domain — landing page loads
- [ ] Click "Connect with X" — OAuth flow completes
- [ ] First-time user lands on `/onboarding` and steps through the wizard
- [ ] Returning user lands on `/dashboard`
- [ ] Dashboard shows subscriber stats
- [ ] Pro user sees "Win-back DMs" section
- [ ] Cron jobs appear in **Vercel → Settings → Crons** tab
