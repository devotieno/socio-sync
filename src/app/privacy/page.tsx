import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Xync',
  description: 'Privacy Policy for Xync - Twitter/X Management Platform'
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                When you use Xync, we collect information to provide and improve our Twitter/X management services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Account information (email, name) when you sign up</li>
                <li>Twitter/X account connections and access tokens</li>
                <li>Tweets you create and schedule for posting</li>
                <li>Usage data and analytics to improve our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>To post tweets to your connected Twitter/X accounts</li>
                <li>To provide analytics and insights about your tweets</li>
                <li>To improve our service and develop new features</li>
                <li>To communicate with you about your account and our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Sharing and Twitter/X API</h2>
              <p className="text-gray-700 mb-4">
                We connect to Twitter/X on your behalf using their official API:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Twitter/X:</strong> We access your account to post tweets and media on your behalf</li>
                <li><strong>Analytics:</strong> We retrieve engagement data for your tweets to provide insights</li>
                <li><strong>Account Management:</strong> We access basic profile information to manage your connections</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We only access the minimum permissions required for posting and analytics. We do not store your Twitter/X password.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Data Storage and Security</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>All data is encrypted in transit and at rest</li>
                <li>Access tokens are securely stored and encrypted</li>
                <li>We use Firebase for secure data storage</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Your Rights and Data Control</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>You can disconnect Twitter/X accounts at any time</li>
                <li>You can delete your account and all associated data</li>
                <li>You can request a copy of your data</li>
                <li>You can update your information at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Deletion</h2>
              <p className="text-gray-700 mb-4">
                If you want to delete your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Go to your account settings and click "Delete Account"</li>
                <li>Or email us at privacy@yourdomain.com</li>
                <li>We will delete all your data within 30 days</li>
                <li>Some data may be retained for legal compliance purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">Email: privacy@yourdomain.com</p>
                <p className="text-gray-700">Address: [Your Business Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
