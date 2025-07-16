import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Social Media Hub',
  description: 'Terms of Service for Social Media Posting Hub'
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By using Social Media Posting Hub ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Social Media Posting Hub is a platform that allows you to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Connect multiple social media accounts</li>
                <li>Create and schedule posts across platforms</li>
                <li>Manage your social media content from a unified dashboard</li>
                <li>View analytics and insights about your posts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Provide accurate account information</li>
                <li>Keep your login credentials secure</li>
                <li>Comply with all applicable laws and platform policies</li>
                <li>Not use the service for illegal or harmful activities</li>
                <li>Respect intellectual property rights</li>
                <li>Not spam or abuse the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Social Media Platform Compliance</h2>
              <p className="text-gray-700 mb-4">
                When using our service, you must comply with the terms and policies of each social media platform:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Facebook Terms of Service and Community Standards</li>
                <li>Instagram Terms of Use and Community Guidelines</li>
                <li>LinkedIn User Agreement and Professional Community Policies</li>
                <li>Twitter/X Terms of Service and Rules</li>
                <li>All other connected platform policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Content Guidelines</h2>
              <p className="text-gray-700 mb-4">You are responsible for all content you post through our service. Content must not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Contain harmful, offensive, or inappropriate material</li>
                <li>Spread misinformation or false information</li>
                <li>Violate platform-specific content policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Service Availability</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>We strive for 99% uptime but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance</li>
                <li>Social media platform API changes may affect functionality</li>
                <li>We are not responsible for platform outages or policy changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Our service is provided "as is" without warranties. We are not liable for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Content posted through our platform</li>
                <li>Social media platform policy violations</li>
                <li>Account suspensions or restrictions</li>
                <li>Data loss or technical issues</li>
                <li>Business losses or damages</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Account Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate accounts that:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Violate these terms of service</li>
                <li>Engage in abusive or harmful behavior</li>
                <li>Use the service for illegal activities</li>
                <li>Repeatedly violate platform policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these terms from time to time. Continued use of the service after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms of Service, contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">Email: legal@yourdomain.com</p>
                <p className="text-gray-700">Address: [Your Business Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
