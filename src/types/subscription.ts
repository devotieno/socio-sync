export interface Subscription {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused';
  planName: string;
  variantId: string;
  currentPeriodEnd: string;
  createdAt: string;
  cancelledAt?: string | null;
  endsAt?: string | null;
  expiredAt?: string | null;
}

export interface UserSubscriptionData {
  subscription?: Subscription;
  plan: 'free' | 'pro' | 'business';
}
