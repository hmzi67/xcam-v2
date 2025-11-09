# Payment Token Issue - Fix Guide

## Problem

Payment shows "successful" in Stripe but tokens are not added to user account.

## Root Cause

The Stripe webhook at `/api/stripe/webhook` is not being called when checkout completes.

## Database Check Results

- ✅ No payment records found in database
- ✅ Webhook handler code looks correct
- ✅ Environment variables are configured
- ❌ Webhook is not receiving events from Stripe

## Solution

### For Production Deployment:

1. **Configure Stripe Webhook in Dashboard**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Enter webhook URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for:
     - `checkout.session.completed` ✓ (CRITICAL)
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `payment_intent.payment_failed`
   - Copy the "Signing secret" (starts with `whsec_...`)
   - Update `.env` with: `STRIPE_WEBHOOK_SECRET=whsec_...`

### For Local Development:

1. **Install Stripe CLI**

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**

   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   This will output a webhook signing secret like:

   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

4. **Update `.env.local`**

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

5. **Restart your dev server**

   ```bash
   npm run dev
   ```

6. **Test a payment**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC

### Verify It's Working

Check terminal output for these logs:

```
🔔 Webhook received: checkout.session.completed
Session ID: cs_test_...
Parsed values - userId: xxx, planId: plus, tokens: 50
💰 Processing payment for user: xxx
Current balance: 1000
New balance after increment: 1050
✅ Successfully processed payment for user xxx: +50 tokens
```

## Quick Test Script

Run this to check if payment was recorded:

```bash
node scripts/check-payment.js
```

## Common Issues

### Issue 1: "Invalid signature" error

**Solution**: Make sure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe CLI or Dashboard

### Issue 2: Webhook not receiving events

**Solution**:

- For local dev: Make sure `stripe listen` is running
- For production: Check webhook URL is accessible and correct in Stripe Dashboard

### Issue 3: Payment recorded but no tokens added

**Solution**: Check the webhook logs in the terminal - there should be detailed logging

## Manual Token Addition (Emergency Fix)

If you need to manually add tokens to a user:

```javascript
// Run in Node.js or add to scripts/add-tokens.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function addTokens(userEmail, tokens) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  const wallet = await prisma.wallet.upsert({
    where: { userId: user.id },
    update: { balance: { increment: tokens } },
    create: { userId: user.id, balance: tokens, currency: "USD" },
  });

  await prisma.ledgerEntry.create({
    data: {
      userId: user.id,
      type: "ADJUSTMENT",
      amount: tokens,
      currency: "USD",
      balanceAfter: wallet.balance,
      description: "Manual token adjustment - payment reconciliation",
    },
  });

  console.log(`✅ Added ${tokens} tokens to ${userEmail}`);
  await prisma.$disconnect();
}

// Usage:
addTokens("user@example.com", 50);
```
