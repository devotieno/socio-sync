import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Deletion - Xync',
  description: 'Request data deletion for Xync - Twitter/X Management Platform'
}

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Deletion Request</h1>
          
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <p className="text-gray-700 mb-6">
                If you want to delete your data from Xync, you have several options:
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Account Deletion</h3>
                <p className="text-blue-700 mb-4">
                  The fastest way to delete your account and all associated data is through your account settings.
                </p>
                <a 
                  href="/dashboard/settings" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Account Settings
                </a>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">What Data Will Be Deleted</h2>
              <p className="text-gray-700 mb-4">
                When you delete your account, we will remove:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Your account information (email, name, profile data)</li>
                <li>All stored Twitter/X access tokens</li>
                <li>Your tweet history and scheduled tweets</li>
                <li>Analytics data and insights</li>
                <li>Account preferences and settings</li>
                <li>Any uploaded media files</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Deletion Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Immediate</h4>
                    <p className="text-gray-700">Account access is disabled immediately</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">24 Hours</h4>
                    <p className="text-gray-700">Personal data and access tokens are deleted</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">30 Days</h4>
                    <p className="text-gray-700">All data is permanently deleted from our systems</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manual Deletion Request</h2>
              <p className="text-gray-700 mb-4">
                If you're unable to access your account or prefer to request deletion manually, 
                please email us with the following information:
              </p>
              
              <div className="bg-gray-100 p-6 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Required Information:</h4>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Email address associated with your account</li>
                  <li>Full name on the account</li>
                  <li>Reason for deletion request</li>
                  <li>Confirmation that you want all data permanently deleted</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Important Notice</h4>
                <p className="text-red-700">
                  Data deletion is permanent and cannot be undone. Make sure to download any content 
                  or data you want to keep before requesting deletion.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact for Data Deletion</h2>
              <div className="bg-white border border-gray-200 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Send your data deletion request to:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> privacy@yourdomain.com</p>
                  <p className="text-gray-700"><strong>Subject:</strong> Data Deletion Request</p>
                  <p className="text-gray-700"><strong>Response Time:</strong> Within 48 hours</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Alternative: Disconnect Social Media Accounts</h2>
              <p className="text-gray-700 mb-4">
                If you only want to remove social media connections without deleting your entire account:
              </p>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Go to your Dashboard → Connected Accounts</li>
                <li>Click "Disconnect" next to each platform</li>
                <li>Confirm the disconnection</li>
                <li>Your social media data will be removed within 24 hours</li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
