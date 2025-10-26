# Stripe Payment Integration

This document provides setup instructions for the Stripe payment integration.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application URL (required for checkout redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Your Stripe Keys

1. **Create a Stripe Account**

   - Go to [https://stripe.com](https://stripe.com) and sign up
   - Complete the account setup

2. **Get API Keys**

   - Navigate to [Dashboard > Developers > API Keys](https://dashboard.stripe.com/test/apikeys)
   - Copy your **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy your **Secret key** → `STRIPE_SECRET_KEY`

3. **Set Up Webhook**
   - Go to [Dashboard > Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
   - Click "Add endpoint"
   - Set the endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
   - Select events to listen to:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `payment_intent.payment_failed`
   - Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

## Pricing Plans

The following pricing plans are available:

| Plan  | Price | Tokens | Description                      |
| ----- | ----- | ------ | -------------------------------- |
| Basic | $5    | 10     | Access to public streams         |
| Plus  | $15   | 50     | Most popular, GOLD show access   |
| Pro   | $50   | 200    | Unlimited messaging, VIP support |

## Payment Flow

1. User selects a pricing plan on `/pricing` page
2. User clicks "Get [Plan]" button
3. App redirects to `/checkout?plan=[planId]`
4. Checkout page creates Stripe Checkout Session
5. User is redirected to Stripe's hosted checkout page
6. User completes payment
7. Stripe sends webhook to `/api/stripe/webhook`
8. Webhook handler:
   - Updates user's wallet balance
   - Creates payment record
   - Creates ledger entry
9. User is redirected back to `/profile/[userId]/payments?success=true`

## Testing

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work.

## Database Tables Used

- `Wallet` - Stores user token balance
- `Payment` - Records all payment transactions
- `LedgerEntry` - Tracks all balance changes

## Local Development with Stripe CLI

1. Install Stripe CLI:

   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
   tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
   ```

2. Login to Stripe:

   ```bash
   stripe login
   ```

3. Forward webhooks to local server:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Test the webhook:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Security Notes

- Never commit your `.env.local` file
- Use test mode keys during development
- Switch to live keys only in production
- Verify webhook signatures to prevent fraudulent requests
- The webhook endpoint doesn't require authentication (Stripe handles this via signatures)

## Troubleshooting

### Webhook not receiving events

- Check if Stripe CLI is running
- Verify webhook secret matches the one from CLI
- Check server logs for errors

### Payment not updating balance

- Check webhook logs in Stripe Dashboard
- Verify database connection
- Check Prisma schema matches database

### Checkout session creation fails

- Verify Stripe secret key is correct
- Check if user is authenticated
- Verify plan ID is valid

## API Routes

- `POST /api/stripe/create-checkout-session` - Creates a Stripe checkout session
- `POST /api/stripe/webhook` - Handles Stripe webhook events

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
