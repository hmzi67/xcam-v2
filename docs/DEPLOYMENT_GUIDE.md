# Deploying XCAM to Netlify - Complete Guide

## ⚠️ IMPORTANT: Netlify Limitations

**Netlify has limitations with Next.js App Router and API Routes:**

- Netlify uses **Next.js Runtime v5** which has limited support for App Router features
- API routes may have issues with streaming, webhooks, and real-time features
- **Recommendation: Use Vercel instead** (built by Next.js creators, full support)

However, if you must use Netlify, here's how:

---

## Option 1: Deploy to Vercel (RECOMMENDED) ⭐

### Why Vercel?

- ✅ Built by Next.js creators
- ✅ Full App Router support
- ✅ Automatic Edge Functions
- ✅ WebSocket support for LiveKit
- ✅ API routes work perfectly
- ✅ **Free tier includes everything you need**

### Steps:

1. **Push to GitHub** (if not already):

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Vercel:**

   - Visit: https://vercel.com
   - Sign up with GitHub
   - Click "Add New Project"
   - Import your `xcam-v2` repository

3. **Configure Environment Variables:**
   In Vercel dashboard, add all these variables:

   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_JLEGf06TCFxo@ep-cold-pond-aefzouvj-pooler.c-2.us-east-2.aws.neon.tech/xcam?sslmode=require&channel_binding=require

   EMAIL_HOST=smtp.hostinger.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=naveed@codehuntspk.com
   EMAIL_PASS=Naveed@hunts1577
   EMAIL_FROM_NAME=XCam Dev Team
   EMAIL_FROM_EMAIL=your-email@domain.com

   LIVEKIT_URL=wss://your-livekit-url.livekit.cloud
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret

   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
   STRIPE_WEBHOOK_SECRET=whsec_[GET_NEW_SECRET_FROM_STRIPE_DASHBOARD]

   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   CRON_SECRET=your_cron_secret

   AUTH_SECRET=[GENERATE_NEW_SECRET]
   ```

4. **Generate AUTH_SECRET:**

   ```bash
   openssl rand -base64 32
   ```

5. **Deploy:**

   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

6. **Configure Stripe Webhook:**

   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy the **new production webhook secret**
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel dashboard
   - Redeploy

7. **Update Google OAuth:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Edit your OAuth client
   - Add authorized redirect URI:
     `https://your-app.vercel.app/api/auth/callback/google`

---

## Option 2: Deploy to Netlify (NOT RECOMMENDED)

### Prerequisites:

1. **Update next.config.ts for Netlify:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Netlify
  images: {
    unoptimized: true, // Netlify doesn't support Next.js Image Optimization
  },
};

export default nextConfig;
```

2. **Create netlify.toml:**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/"
  status = 200

[functions]
  node_bundler = "esbuild"
```

3. **Install Netlify CLI:**

```bash
npm install -g netlify-cli
```

### Deploy Steps:

1. **Login to Netlify:**

   ```bash
   netlify login
   ```

2. **Initialize site:**

   ```bash
   netlify init
   ```

3. **Set environment variables:**

   ```bash
   netlify env:set DATABASE_URL "postgresql://..."
   netlify env:set STRIPE_SECRET_KEY "sk_test_..."
   netlify env:set STRIPE_PUBLIC_KEY "pk_test_..."
   netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..."
   netlify env:set NEXT_PUBLIC_APP_URL "https://your-app.netlify.app"
   # ... add all other env vars
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### ⚠️ Known Issues with Netlify:

1. **API Routes may timeout** (10 second limit)
2. **WebSocket connections limited** (LiveKit may not work properly)
3. **Streaming responses not supported**
4. **Middleware has limitations**
5. **Stripe webhooks may be unreliable**

---

## Comparison: Vercel vs Netlify

| Feature            | Vercel          | Netlify           |
| ------------------ | --------------- | ----------------- |
| Next.js App Router | ✅ Full Support | ⚠️ Limited        |
| API Routes         | ✅ Perfect      | ⚠️ Issues         |
| WebSockets         | ✅ Supported    | ❌ Limited        |
| Streaming          | ✅ Supported    | ❌ Not supported  |
| Function Timeout   | ✅ 60s+         | ⚠️ 10s (26s paid) |
| Image Optimization | ✅ Built-in     | ❌ Must disable   |
| Build Time         | ✅ Fast         | ⚠️ Slower         |
| Free Tier          | ✅ Generous     | ✅ Good           |
| Price              | $ Free → Paid   | $ Free → Paid     |

---

## Post-Deployment Checklist

After deploying to either platform:

- [ ] Test login/registration
- [ ] Test Google OAuth
- [ ] Test payment flow ($5 package with test card)
- [ ] Verify webhook receives events
- [ ] Check tokens are added after payment
- [ ] Test live streaming
- [ ] Test chat functionality
- [ ] Check email sending works
- [ ] Monitor error logs

---

## Production Stripe Webhook Setup

**CRITICAL:** Your current webhook secret is for local development. For production:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://your-actual-domain.com/api/stripe/webhook`
4. Select events:
   - ✓ `checkout.session.completed`
   - ✓ `checkout.session.async_payment_succeeded`
   - ✓ `checkout.session.async_payment_failed`
5. Copy the **NEW** webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in your deployment platform
7. Redeploy

---

## Environment Variables Checklist

Make sure ALL these are set in your deployment:

- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `AUTH_SECRET` - New random secret for production
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL
- [ ] `STRIPE_SECRET_KEY` - Stripe API key
- [ ] `STRIPE_PUBLIC_KEY` - Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - **NEW production webhook secret**
- [ ] `LIVEKIT_URL` - LiveKit WebSocket URL
- [ ] `LIVEKIT_API_KEY` - LiveKit API key
- [ ] `LIVEKIT_API_SECRET` - LiveKit API secret
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `EMAIL_HOST` - SMTP host
- [ ] `EMAIL_PORT` - SMTP port
- [ ] `EMAIL_USER` - SMTP username
- [ ] `EMAIL_PASS` - SMTP password
- [ ] `EMAIL_FROM_NAME` - Email sender name
- [ ] `EMAIL_FROM_EMAIL` - Email sender address
- [ ] `CRON_SECRET` - Cron job secret

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run build
```

### Database Connection Issues

- Make sure `DATABASE_URL` has `?sslmode=require`
- Check Neon database is accessible from deployment IP

### Payment Webhook Not Working

- Verify webhook URL in Stripe dashboard
- Check webhook secret matches
- Look at webhook logs in Stripe dashboard
- Check deployment logs for errors

### LiveKit Streaming Issues

- Verify WebSocket support (Vercel: ✅, Netlify: ⚠️)
- Check LIVEKIT_URL is correct
- Verify API keys are valid

---

## My Recommendation

**Use Vercel.** Here's why:

1. Your app uses Next.js App Router extensively
2. You need WebSocket support for LiveKit
3. Stripe webhooks are critical
4. API routes are heavily used
5. Vercel is made by Next.js creators

Netlify is great for static sites, but your app needs full Next.js features.

---

## Quick Deploy to Vercel (5 minutes)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy (follow prompts)
vercel

# 4. Add environment variables in Vercel dashboard
# 5. Configure Stripe webhook
# 6. Deploy production
vercel --prod
```

Done! 🚀

---

Need help? Check the deployment logs for specific errors.
