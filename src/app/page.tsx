'use client';

import { useState } from 'react';
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, SparklesIcon, ChartBarIcon, CalendarDaysIcon, RocketLaunchIcon, BoltIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Logo from "@/components/Logo";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background Elements - Subtle Grey Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-40 w-96 h-96 bg-slate-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-72 h-72 bg-slate-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        {/* Spotlight effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-slate-800/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={36} showText={true} />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-slate-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-800/50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white text-black px-6 py-2.5 rounded-lg hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all font-semibold"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 space-y-2 border-t border-slate-800/50 pt-4">
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-slate-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-white text-black px-6 py-3 rounded-lg hover:shadow-xl hover:shadow-white/20 transition-all font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="container mx-auto px-4 py-16 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto relative z-10">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Highlight Badge */}
              <div className="inline-flex items-center backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2 mb-6 shadow-lg hover:shadow-white/10 transition-shadow">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 border-2 border-slate-800"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 border-2 border-slate-800"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 border-2 border-slate-800"></div>
                </div>
                <span className="text-slate-300 font-medium text-sm">Join 10,000+ creators</span>
              </div>
              
              <h1 className="font-outfit text-5xl md:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                Grow Your
                <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mt-2">Twitter/X Presence</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
                Your all-in-one platform to <span className="font-semibold text-slate-200">schedule tweets</span>, 
                <span className="font-semibold text-slate-200"> manage multiple accounts</span>, and 
                <span className="font-semibold text-slate-200"> track performance</span> — all from one dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <Link
                  href="/auth/signup"
                  className="group bg-white text-black px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all font-semibold text-lg flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="group backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 px-8 py-4 rounded-xl hover:bg-slate-700/50 hover:border-slate-600/50 transition-all font-semibold text-lg flex items-center justify-center"
                >
                  Watch Demo
                  <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-slate-400 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual/Stats */}
            <div className="relative lg:block hidden">
              {/* Main Dashboard Preview Card */}
              <div className="backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/50 animate-float">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
                    <div>
                      <h3 className="font-outfit font-bold text-lg text-white">Analytics Overview</h3>
                      <p className="text-sm text-slate-400">Last 30 days</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-lg shadow-slate-900/50"></div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
                      <div className="text-2xl font-bold text-white">2.4M</div>
                      <div className="text-sm text-slate-400">Impressions</div>
                      <div className="text-xs text-slate-300 font-medium mt-1">↑ 23.5%</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
                      <div className="text-2xl font-bold text-white">48.2K</div>
                      <div className="text-sm text-slate-400">Engagements</div>
                      <div className="text-xs text-slate-300 font-medium mt-1">↑ 18.2%</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
                      <div className="text-2xl font-bold text-white">156</div>
                      <div className="text-sm text-slate-400">Tweets Posted</div>
                      <div className="text-xs text-slate-300 font-medium mt-1">This month</div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
                      <div className="text-2xl font-bold text-white">3.2%</div>
                      <div className="text-sm text-slate-400">Engagement Rate</div>
                      <div className="text-xs text-slate-300 font-medium mt-1">↑ 0.8%</div>
                    </div>
                  </div>
                  
                  {/* Chart Placeholder */}
                  <div className="bg-slate-800/30 rounded-xl p-4 h-32 flex items-end justify-between gap-2">
                    <div className="w-full bg-gradient-to-t from-slate-500 to-slate-400 rounded-t shadow-lg shadow-slate-500/50" style={{ height: '45%' }}></div>
                    <div className="w-full bg-gradient-to-t from-slate-600 to-slate-500 rounded-t shadow-lg shadow-slate-600/50" style={{ height: '70%' }}></div>
                    <div className="w-full bg-gradient-to-t from-slate-400 to-slate-300 rounded-t shadow-lg shadow-slate-400/50" style={{ height: '55%' }}></div>
                    <div className="w-full bg-gradient-to-t from-slate-500 to-slate-400 rounded-t shadow-lg shadow-slate-500/50" style={{ height: '85%' }}></div>
                    <div className="w-full bg-gradient-to-t from-slate-600 to-slate-500 rounded-t shadow-lg shadow-slate-600/50" style={{ height: '65%' }}></div>
                    <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 rounded-t shadow-lg shadow-slate-300/50" style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 backdrop-blur-xl bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/50 animate-pulse" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shadow-lg shadow-slate-200/50">
                    <CheckIcon className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Tweet Scheduled</div>
                    <div className="font-semibold text-white">Tomorrow, 9:00 AM</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 backdrop-blur-xl bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/50 animate-pulse" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black font-bold shadow-lg shadow-white/30">
                    3
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Accounts Connected</div>
                    <div className="font-semibold text-white">@yourhandle +2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="mb-3">
              <span className="font-outfit text-lg font-semibold text-slate-400">𝕏ync Features</span>
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to succeed on Twitter/X
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to help you create, schedule, and analyze your Twitter/X content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-white/5 hover:scale-105 hover:border-slate-600/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-slate-500/50 transition-transform">
                <CalendarDaysIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-3">
                Smart Scheduling
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Schedule tweets across multiple Twitter/X accounts with AI-powered timing suggestions for maximum engagement.
              </p>
            </div>

            <div className="group backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-white/5 hover:scale-105 hover:border-slate-600/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-slate-400/50 transition-transform">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-3">
                Analytics & Insights
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Track performance with detailed analytics including engagement rates, reach, and audience insights.
              </p>
            </div>

            <div className="group backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-white/5 hover:scale-105 hover:border-slate-600/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-300 to-slate-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-slate-300/50 transition-transform">
                <RocketLaunchIcon className="w-7 h-7 text-slate-900" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-3">
                Multiple Twitter/X Accounts
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Manage multiple Twitter/X accounts seamlessly from one unified dashboard. Switch between accounts instantly.
              </p>
            </div>
            
            <div className="group backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-white/5 hover:scale-105 hover:border-slate-600/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-slate-600/50 transition-transform">
                <BoltIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Built with modern technology for blazing-fast performance and seamless user experience.
              </p>
            </div>
            
            <div className="group backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-white/5 hover:scale-105 hover:border-slate-600/50 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-400 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-slate-200/50 transition-transform">
                <ShieldCheckIcon className="w-7 h-7 text-slate-900" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-3">
                Secure & Private
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Your data is encrypted and secure. We never share your information with third parties.
              </p>
            </div>
            
            <div className="group backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 p-8 rounded-2xl hover:shadow-2xl hover:shadow-white/5 hover:scale-105 hover:border-slate-600/50 transition-all">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/50 transition-transform">
                <SparklesIcon className="w-7 h-7 text-black" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white mb-3">
                AI-Powered Tools
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Leverage AI for content suggestions, hashtag recommendations, and optimal posting times.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="relative backdrop-blur-xl bg-slate-900/50 border border-slate-700/50 rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-800/30 to-slate-700/30"></div>
            <div className="relative z-10">
              <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to elevate your Twitter/X game?
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Join thousands of content creators and businesses who trust <span className="font-semibold text-white">𝕏ync</span> to manage their Twitter/X presence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="bg-white text-black px-10 py-4 rounded-xl hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all font-semibold text-lg"
                >
                  Start Your Free Trial
                </Link>
                <Link
                  href="/auth/signin"
                  className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 text-white px-10 py-4 rounded-xl hover:bg-slate-700/50 hover:border-slate-600/50 transition-all font-semibold text-lg"
                >
                  Sign In
                </Link>
              </div>
              
              {/* Social Proof */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-slate-400">
                <div className="text-center">
                  <div className="font-outfit text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-outfit text-3xl font-bold text-white">1M+</div>
                  <div className="text-sm">Posts Scheduled</div>
                </div>
                <div className="text-center">
                  <div className="font-outfit text-3xl font-bold text-white">99.9%</div>
                  <div className="text-sm">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo size={32} showText={true} />
              </div>
              <p className="text-slate-400 text-sm">
                The modern way to manage your Twitter/X presence.
              </p>
            </div>
            <div>
              <h4 className="font-outfit font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-outfit font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/data-deletion" className="hover:text-white transition-colors">Data Deletion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-outfit font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="mailto:support@xync.app" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-slate-400 text-sm pt-8 border-t border-slate-800/50">
            <p>&copy; 2026 <span className="font-semibold text-white">𝕏ync</span>. All rights reserved. Made with ❤️ for content creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
