'use client';

import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/lemonsqueezy';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicPricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleGetStarted = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/signup');
    } else {
      router.push('/auth/signup?plan=' + planId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300">
            Supercharge your Twitter/X presence with 𝕏ync
          </p>
          <p className="text-base text-slate-400 mt-2">
            All plans include secure OAuth authentication and real-time analytics
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
                onClick={() => handleGetStarted(plan.id)}
                disabled={loading === plan.id}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-all
                  ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
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
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 max-w-3xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
            <div className="text-left space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-slate-400">Yes! Cancel your subscription anytime from your dashboard. No questions asked.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Do you offer refunds?</h4>
                <p className="text-slate-400">We offer a 14-day money-back guarantee on all paid plans.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Can I upgrade or downgrade?</h4>
                <p className="text-slate-400">Absolutely! Switch between plans anytime and we'll prorate the difference.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Is my Twitter/X data secure?</h4>
                <p className="text-slate-400">Yes! We use OAuth 2.0 authentication and encrypt all stored credentials. We never store your Twitter password.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Can I try before I buy?</h4>
                <p className="text-slate-400">Yes! Start with our free plan and upgrade anytime when you're ready for more features.</p>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            Need a custom enterprise plan?{' '}
            <a
              href="mailto:support@xync.app"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
