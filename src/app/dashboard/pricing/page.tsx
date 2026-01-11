'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SUBSCRIPTION_PLANS } from '@/lib/lemonsqueezy';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (variantId: string, planId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!variantId) {
      alert('This plan is not available');
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300">
            Choose the plan that works best for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-8 backdrop-blur-xl
                ${
                  plan.id === 'pro'
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50 transform scale-105'
                    : 'bg-slate-800/50 border border-slate-700/50'
                }
              `}
            >
              {/* Popular Badge */}
              {plan.id === 'pro' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-slate-400 ml-2">/{plan.interval}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.variantId, plan.id)}
                disabled={loading === plan.id || plan.id === 'free'}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-all
                  ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : plan.id === 'free'
                      ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                `}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : plan.id === 'free' ? (
                  'Current Plan'
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-4">
            All plans include a 14-day money-back guarantee
          </p>
          <p className="text-slate-500 text-sm">
            Need a custom plan for your team?{' '}
            <a
              href="mailto:support@yourapp.com"
              className="text-blue-400 hover:text-blue-300"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
