import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';

/**
 * Verify webhook signature from Lemonsqueezy
 */
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === digest;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const eventName = event.meta.event_name;
    const subscriptionData = event.data;
    const userId = subscriptionData.attributes.custom_data?.user_id;

    if (!userId) {
      console.error('No user ID in webhook data');
      return NextResponse.json({ received: true });
    }

    // Handle different webhook events
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(userId, subscriptionData);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(userId, subscriptionData);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(userId, subscriptionData);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(userId, subscriptionData);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(userId, subscriptionData);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(userId, subscriptionData);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(userId, subscriptionData);
        break;

      default:
        console.log('Unhandled webhook event:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(userId: string, data: any) {
  const attrs = data.attributes;
  
  await adminDb.collection('users').doc(userId).update({
    subscription: {
      id: data.id,
      status: attrs.status,
      planName: attrs.product_name,
      variantId: attrs.variant_id,
      currentPeriodEnd: attrs.renews_at,
      createdAt: new Date().toISOString(),
    },
    updatedAt: new Date(),
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(userId: string, data: any) {
  const attrs = data.attributes;
  
  await adminDb.collection('users').doc(userId).update({
    'subscription.status': attrs.status,
    'subscription.planName': attrs.product_name,
    'subscription.variantId': attrs.variant_id,
    'subscription.currentPeriodEnd': attrs.renews_at,
    updatedAt: new Date(),
  });

  console.log(`Subscription updated for user ${userId}`);
}

async function handleSubscriptionCancelled(userId: string, data: any) {
  const attrs = data.attributes;
  
  await adminDb.collection('users').doc(userId).update({
    'subscription.status': 'cancelled',
    'subscription.cancelledAt': new Date().toISOString(),
    'subscription.endsAt': attrs.ends_at,
    updatedAt: new Date(),
  });

  console.log(`Subscription cancelled for user ${userId}`);
}

async function handleSubscriptionResumed(userId: string, data: any) {
  const attrs = data.attributes;
  
  await adminDb.collection('users').doc(userId).update({
    'subscription.status': attrs.status,
    'subscription.cancelledAt': null,
    'subscription.endsAt': null,
    updatedAt: new Date(),
  });

  console.log(`Subscription resumed for user ${userId}`);
}

async function handleSubscriptionExpired(userId: string, data: any) {
  await adminDb.collection('users').doc(userId).update({
    'subscription.status': 'expired',
    'subscription.expiredAt': new Date().toISOString(),
    updatedAt: new Date(),
  });

  console.log(`Subscription expired for user ${userId}`);
}

async function handlePaymentSuccess(userId: string, data: any) {
  console.log(`Payment successful for user ${userId}`);
  // You can store payment history if needed
}

async function handlePaymentFailed(userId: string, data: any) {
  console.log(`Payment failed for user ${userId}`);
  // You might want to notify the user
}
