# Payment Issue - Complete Diagnosis and Fix

## Problem Summary

User purchased $15 package (50 tokens), Stripe shows "Payment Successful", but tokens were NOT added to account.

## Root Cause

**Stripe webhook is not configured or not receiving events.**

The payment flow works like this:

1. ✅ User clicks "Buy Package" → Works
2. ✅ Stripe Checkout Session created → Works
3. ✅ User pays on Stripe → Works
4. ❌ **Stripe webhook NOT called** → BROKEN
5. ❌ Tokens not added to database → BROKEN

## Evidence

- Database check shows: **0 payment records**
- Wallets show only dummy test credits (1000 tokens)
- No ledger entries for payments
- Webhook code exists but never executes

## The Fix

### Quick Fix (For Affected User)

If someone already paid and didn't get tokens, manually add them:

```bash
cd /Users/Projects/shehryarr/XCAM/X-cam/xcam

# For $5 package (10 tokens):
node scripts/add-tokens.js user@email.com 10 "Payment reconciliation - $5 package"

# For $15 package (50 tokens):
node scripts/add-tokens.js user@email.com 50 "Payment reconciliation - $15 package"

# For $50 package (200 tokens):
node scripts/add-tokens.js user@email.com 200 "Payment reconciliation - $50 package"
```

### Permanent Fix (Choose ONE based on environment)

#### Option A: Local Development (Testing)

1. **Install Stripe CLI:**

   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe:**

   ```bash
   stripe login
   ```

3. **Start webhook forwarding (keep this running):**

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   You'll see output like:

   ```
   > Ready! Your webhook signing secret is whsec_1234567890abcdef
   ```

4. **Copy the webhook secret and update `.env.local`:**

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
   ```

5. **Restart dev server:**

   ```bash
   npm run dev
   ```

6. **Test with Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

#### Option B: Production Deployment

1. **Go to Stripe Dashboard:**
   https://dashboard.stripe.com/webhooks

2. **Click "Add endpoint"**

3. **Configure webhook:**

   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Description: `XCAM Payment Webhook`
   - Events to send:
     - ✓ `checkout.session.completed` (CRITICAL!)
     - ✓ `checkout.session.async_payment_succeeded`
     - ✓ `checkout.session.async_payment_failed`
     - ✓ `payment_intent.payment_failed`

4. **Copy signing secret:**

   - Click on the webhook you just created
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

5. **Update production environment variables:**

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
   ```

6. **Redeploy application**

## How to Verify It's Working

### 1. Check Configuration

Visit: http://localhost:3000/api/stripe/config

Should show:

```json
{
  "config": {
    "hasStripeSecretKey": true,
    "hasStripePublicKey": true,
    "hasWebhookSecret": true,
    "hasAppUrl": true
  }
}
```

### 2. Test a Payment

When you test a payment, you should see these logs in terminal:

```
🎯 Webhook endpoint hit
✅ Webhook signature verified
🔔 Webhook received: checkout.session.completed
Session ID: cs_test_xxxxx
Session metadata: { userId: 'xxx', planId: 'plus', tokens: '50' }
Parsed values - userId: xxx, planId: plus, tokens: 50
💰 Processing payment for user: xxx
Current balance: 1000
New balance after increment: 1050
✅ Successfully processed payment for user xxx: +50 tokens (New balance: 1050)
```

### 3. Verify in Database

```bash
node scripts/check-payment.js
```

Should show:

- New payment record with status: SUCCEEDED
- Wallet balance increased
- New ledger entry with type: DEPOSIT

## Common Issues & Solutions

### Issue 1: "Webhook secret not configured"

**Solution:** Set `STRIPE_WEBHOOK_SECRET` in `.env` or `.env.local`

### Issue 2: "Invalid signature"

**Solution:**

- Local dev: Get secret from `stripe listen` command
- Production: Get secret from Stripe Dashboard webhook settings
- Make sure you're using the right secret for the right environment

### Issue 3: Webhook never receives events

**Solution:**

- Local dev: Make sure `stripe listen` is running
- Production: Check webhook URL is publicly accessible
- Production: Check webhook is enabled in Stripe Dashboard

### Issue 4: Events received but no tokens added

**Solution:** Check terminal logs for errors in the webhook handler

## Testing Checklist

- [ ] Environment variables configured
- [ ] Webhook endpoint accessible
- [ ] Stripe CLI running (local) OR Dashboard configured (production)
- [ ] Test payment completes successfully
- [ ] Webhook logs appear in terminal
- [ ] Payment record created in database
- [ ] Wallet balance increases
- [ ] Ledger entry created
- [ ] User can see tokens in profile

## Files Modified

1. **New Files:**

   - `scripts/add-tokens.js` - Manual token addition script
   - `scripts/check-payment.js` - Payment verification script
   - `docs/PAYMENT_FIX_GUIDE.md` - Detailed fix guide
   - `src/app/api/stripe/config/route.ts` - Configuration check endpoint

2. **Enhanced Files:**
   - `src/app/api/stripe/webhook/route.ts` - Added better logging

## Support Commands

```bash
# Check payments
node scripts/check-payment.js

# Add tokens manually
node scripts/add-tokens.js email@example.com 50 "Reason"

# Check Stripe config
curl http://localhost:3000/api/stripe/config

# Listen to webhooks (local dev)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test webhook (local dev)
stripe trigger checkout.session.completed
```

## Next Steps

1. Choose your environment (local dev or production)
2. Follow the appropriate fix steps above
3. Test a payment
4. Verify tokens are added
5. If there are affected users, use `add-tokens.js` to credit them

---

**Need help?** Check the logs in terminal when making a test payment. The webhook handler has detailed logging that will show exactly where the issue is.
