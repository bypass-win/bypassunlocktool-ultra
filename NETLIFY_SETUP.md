# Bypass Unlock Tool - Netlify Deployment Guide

This is a fresh deployment setup. Follow these steps to get NowPayments working on Netlify.

## 🚀 Quick Setup (5 minutes)

### 1. Connect to Netlify
- Go to [netlify.com](https://netlify.com)
- Click **Add new site → Import existing project**
- Select **GitHub → axeoppal-ops/bypassunlocktool**
- Click **Deploy site**

### 2. Add Environment Variables
After deployment, go to:
- **Site settings → Environment variables**
- Add these variables (get your actual values from the services):

```
SUPABASE_PUBLISHABLE_KEY=your_jwt_token_from_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=your_jwt_token_from_supabase
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase
NOWPAYMENTS_API_KEY=your_api_key_from_nowpayments
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_from_nowpayments
SITE_URL=https://bypassunlock.online
ADMIN_SESSION_SECRET=make_a_long_random_secret_here
```

`SUPABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must all come from the same Supabase project. If your Netlify site uses your own Supabase project, run the database tables/migrations there too.

### 3. Redeploy
- Go to **Deployments**
- Click **Trigger deploy**
- Wait for ✅ green checkmark

### 4. Test
Visit: `https://your-site.netlify.app/register/icloud`
- Fill the form
- Click "Generate payment address"
- Should see crypto payment address

---

## 🔑 Where to Get Your API Keys

### Supabase JWT Token:
1. Log in to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings → API**
4. Copy the **"anon" public key** (starts with `eyJ...`)

### NowPayments API Key:
1. Log in to [nowpayments.io](https://nowpayments.io)
2. Go to **Settings → API Keys**
3. Copy your **API Key** (not the IPN secret)

### Supabase Service Role Key:
1. Log in to [supabase.com](https://supabase.com)
2. Select the same project used by your website
3. Go to **Settings → API**
4. Copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`
5. Keep it secret — never put it in any `VITE_` variable

---

## 📝 .env File (Local Development)

The `.env` file only contains non-secret values:
- `VITE_SUPABASE_PROJECT_ID` (public project ID)

**All secrets come from Netlify environment variables during deployment.**

To develop locally:
1. Copy `.env` as-is
2. It will use Netlify env vars during build
3. Don't commit secrets to GitHub

---

## ✅ Troubleshooting

### "Invalid api key" error on payment page?
- Verify `NOWPAYMENTS_API_KEY` is correct in Netlify env vars
- Make sure you copied the **API Key** (not IPN secret)
- Redeploy after adding the variable

### Build fails with "Secrets found"?
- Don't put JWT tokens or API keys in `.env` file
- Only use Netlify environment variables (Site settings → Environment variables)

### Crypto payment not working?
- Check browser console (F12 → Console)
- Check Netlify function logs (Functions tab)
- Verify `NOWPAYMENTS_API_KEY` is set and valid

---

## 🏗️ Project Structure

```
src/
├── lib/
│   └── nowpayments.functions.ts  ← Server-side NowPayments API calls
├── routes/
│   ├── register.$type.tsx         ← Payment page UI
│   └── __root.tsx                 ← Root layout
└── integrations/
    └── supabase/
        └── client.server.ts       ← Supabase admin client

netlify.toml                        ← Build config (auto-deploys functions)
```

---

**Questions? Check the Netlify logs: Deployments → Click a deploy → View logs**
