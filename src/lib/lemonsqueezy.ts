import {
  lemonSqueezySetup,
  getCustomer,
  createCheckout,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  listProducts,
  listVariants
} from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemonsqueezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('Lemonsqueezy Error:', error),
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  variantId: string;
}

// Define your pricing plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      '5 scheduled posts per month',
      '1 connected account',
      'Basic analytics',
    ],
    variantId: '', // No variant for free plan
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited scheduled posts',
      'Up to 5 connected accounts',
      'Advanced analytics',
      'Priority support',
    ],
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '',
  },
  {
    id: 'business',
    name: 'Business',
    price: 29.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited connected accounts',
      'Team collaboration',
      'Custom branding',
      'API access',
    ],
    variantId: process.env.LEMONSQUEEZY_BUSINESS_VARIANT_ID || '',
  },
];

/**
 * Create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  userEmail: string,
  variantId: string,
  redirectUrl?: string
) {
  try {
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutData: {
          email: userEmail,
          custom: {
            user_id: userId,
          },
        },
        checkoutOptions: {
          embed: false,
          media: true,
          logo: true,
        },
        expiresAt: null,
        preview: false,
        testMode: process.env.NODE_ENV === 'development',
      }
    );

    return checkout.data;
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(subscriptionId: string) {
  try {
    const subscription = await getSubscription(subscriptionId);
    return subscription.data;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelUserSubscription(subscriptionId: string) {
  try {
    const result = await cancelSubscription(subscriptionId);
    return result.data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Update subscription (change plan)
 */
export async function updateUserSubscription(
  subscriptionId: string,
  variantId: string
) {
  try {
    const result = await updateSubscription(subscriptionId, {
      variantId: parseInt(variantId),
    });
    return result.data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Check if user can perform action based on their plan limits
 */
export function canPerformAction(
  plan: string,
  action: 'createPost' | 'connectAccount',
  currentCount: number
): boolean {
  const limits = {
    free: {
      posts: 5,
      accounts: 1,
    },
    pro: {
      posts: Infinity,
      accounts: 5,
    },
    business: {
      posts: Infinity,
      accounts: Infinity,
    },
  };

  const planLimits = limits[plan as keyof typeof limits] || limits.free;

  if (action === 'createPost') {
    return currentCount < planLimits.posts;
  } else if (action === 'connectAccount') {
    return currentCount < planLimits.accounts;
  }

  return false;
}
