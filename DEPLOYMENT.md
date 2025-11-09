# 🚀 Quick Deployment Guide

## TL;DR - Deploy in 5 Minutes

### Option 1: Vercel (RECOMMENDED) ⭐

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard
# 4. Configure Stripe webhook with your new Vercel URL
# 5. Deploy to production
vercel --prod
```

**Why Vercel?**

- ✅ Built for Next.js
- ✅ All features work perfectly
- ✅ Free tier is generous
- ✅ WebSocket support for LiveKit
- ✅ Stripe webhooks work flawlessly

---

### Option 2: Netlify (Use at your own risk)

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify init
netlify deploy --prod
```

**⚠️ Warning:** Netlify has limited Next.js App Router support. You may experience:

- API route timeouts
- WebSocket issues with LiveKit
- Unreliable Stripe webhooks

---

## Before Deploying

1. **Generate new AUTH_SECRET:**

   ```bash
   openssl rand -base64 32
   ```

2. **Run deployment check:**

   ```bash
   ./scripts/check-deployment.sh
   ```

3. **Build locally to test:**
   ```bash
   npm run build
   ```

---

## After Deployment

1. **Configure Stripe Webhook:**

   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Copy new webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in deployment dashboard

2. **Update Google OAuth:**

   - Go to: https://console.cloud.google.com/apis/credentials
   - Add redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

3. **Test everything:**
   - Login works
   - Payment works (test card: 4242 4242 4242 4242)
   - Tokens added after payment
   - Streaming works

---

## Environment Variables Needed

Copy these to your deployment platform:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM_NAME=
EMAIL_FROM_EMAIL=
CRON_SECRET=
```

---

## 📚 Full Documentation

- **Complete Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Payment Fix:** `docs/PAYMENT_ISSUE_FIX.md`

---

## Need Help?

1. Check build logs for errors
2. Run `./scripts/check-deployment.sh`
3. Read `docs/DEPLOYMENT_GUIDE.md`

**Still stuck?** Make sure you're using Vercel, not Netlify.
