import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Logo size={32} />
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Post to All Major Platforms
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}in One Click{" "}
            </span>
          </h1>
          
          {/* Highlight Badge */}
          <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-6 py-2 mb-6">
            <span className="text-blue-600 font-semibold text-sm">✨ Save Hours Daily • Cross-Post Instantly • Grow Faster</span>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule posts, track analytics, and grow your online presence across
            Twitter, Facebook, Instagram, LinkedIn, TikTok, and YouTube - all from one powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/demo"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              📅
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Scheduling
            </h3>
            <p className="text-gray-600">
              Schedule posts across multiple platforms with optimal timing suggestions
              based on your audience engagement.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              📊
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600">
              Track your performance with detailed analytics including views, likes,
              shares, and engagement rates.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              🔗
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              One-Click Publishing
            </h3>
            <p className="text-gray-600">
              Post to Twitter, Facebook, Instagram, LinkedIn, TikTok,
              Threads, and YouTube simultaneously with just one click.
            </p>
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Supported Platforms
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { name: 'Twitter', icon: '🐦' },
              { name: 'Facebook', icon: '📘' },
              { name: 'Instagram', icon: '📷' },
              { name: 'LinkedIn', icon: '💼' },
              { name: 'TikTok', icon: '🎵' },
              { name: 'Threads', icon: '🧵' },
              { name: 'YouTube', icon: '📺' },
            ].map((platform) => (
              <div
                key={platform.name}
                className="flex items-center space-x-3 bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100"
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className="font-semibold text-gray-900">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2025 SocialSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
