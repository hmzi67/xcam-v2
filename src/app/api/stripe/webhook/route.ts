import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use a valid, typed API version supported by the installed stripe SDK
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log("🔔 Webhook received: checkout.session.completed");
        console.log("Session ID:", session.id);
        console.log("Session metadata:", session.metadata);
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const tokens = parseInt(session.metadata?.tokens || "0");

        console.log("Parsed values - userId:", userId, "planId:", planId, "tokens:", tokens);

        if (!userId || !tokens) {
          console.error("Missing userId or tokens in session metadata");
          return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
        }

        // Check if payment already exists to prevent duplicates
        const existingPayment = await prisma.payment.findUnique({
          where: { providerRef: session.id },
        });

        if (existingPayment) {
          console.log("⚠️ Payment already processed, skipping:", session.id);
          return NextResponse.json({ received: true, message: "Already processed" });
        }

        console.log("💰 Processing payment for user:", userId);

        // Get current balance before update
        const currentWallet = await prisma.wallet.findUnique({
          where: { userId },
          select: { balance: true },
        });

        console.log("Current balance:", currentWallet?.balance || 0);

        // Create or update wallet and get updated balance
        const wallet = await prisma.wallet.upsert({
          where: { userId },
          update: {
            balance: {
              increment: tokens,
            },
            updatedAt: new Date(),
          },
          create: {
            userId,
            balance: tokens,
            currency: "USD",
          },
        });

        // Fetch the updated wallet to get the correct balance after increment
        const updatedWallet = await prisma.wallet.findUnique({
          where: { userId },
          select: { balance: true },
        });

        console.log("New balance after increment:", updatedWallet?.balance);

        // Create payment record
        await prisma.payment.create({
          data: {
            userId,
            provider: "STRIPE",
            providerRef: session.id,
            status: "SUCCEEDED",
            amount: (session.amount_total || 0) / 100, // Convert cents to dollars
            currency: session.currency?.toUpperCase() || "USD",
            credits: tokens,
            webhookData: session as any,
            completedAt: new Date(),
          },
        });

        // Create ledger entry with correct balance after increment
        await prisma.ledgerEntry.create({
          data: {
            userId,
            type: "DEPOSIT",
            amount: tokens,
            currency: "USD",
            balanceAfter: updatedWallet?.balance || wallet.balance,
            referenceType: "PAYMENT",
            referenceId: session.id,
            description: `Purchased ${planId} plan - ${tokens} tokens`,
            metadata: {
              planId,
              stripeSessionId: session.id,
            },
          },
        });

        console.log(`✅ Successfully processed payment for user ${userId}: +${tokens} tokens (New balance: ${updatedWallet?.balance})`);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle async payment success (similar to above)
        console.log("Async payment succeeded:", session.id);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;
        if (userId) {
          await prisma.payment.create({
            data: {
              userId,
              provider: "STRIPE",
              providerRef: session.id,
              status: "FAILED",
              amount: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || "USD",
              credits: 0,
              webhookData: session as any,
              failureReason: "Async payment failed",
            },
          });
        }
        
        console.log("Async payment failed:", session.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
