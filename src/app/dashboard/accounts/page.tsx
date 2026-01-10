'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import TwitterAccount from '@/components/TwitterAccount';
import { MultiPlatformManager } from '@/components/MultiPlatformManager';

export default function AccountsPage() {
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // Check for connection notifications
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'twitter_linked') {
      setNotification('Twitter account linked successfully!');
      setNotificationType('success');
      setTimeout(() => setNotification(''), 5000);
    } else if (error) {
      const details = searchParams.get('details');
      let errorMessage = 'An error occurred';
      
      switch (error) {
        case 'twitter_auth_failed':
          errorMessage = details 
            ? `Twitter authentication failed: ${details}` 
            : 'Twitter authentication failed. Please check your Twitter app callback URL settings.';
          break;
        case 'missing_code':
          errorMessage = 'Twitter authorization failed. The callback URL might be misconfigured.';
          break;
        case 'session_required':
          errorMessage = 'Please sign in first to link your Twitter account.';
          break;
        case 'missing_verifier':
          errorMessage = 'Twitter verification failed. Please try connecting again.';
          break;
        case 'link_failed':
          errorMessage = 'Failed to link Twitter account. Please try again.';
          break;
        case 'account_already_connected':
          errorMessage = 'This Twitter account is already connected to your profile.';
          break;
      }
      setNotification(errorMessage);
      setNotificationType('error');
      setTimeout(() => setNotification(''), 10000);
    } else if (searchParams.get('connected') === 'twitter') {
      setNotification('Twitter account connected successfully!');
      setNotificationType('success');
      setTimeout(() => setNotification(''), 5000);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-white">
          Connected Accounts
        </h1>
        <p className="mt-2 text-slate-400">
          Manage your Twitter/X account connections
        </p>
      </div>

      <div>
        {notification && (
          <div className="mb-6">
            <div className={`backdrop-blur-xl border rounded-xl p-4 ${
              notificationType === 'success' 
                ? 'bg-green-900/30 border-green-700' 
                : 'bg-red-900/30 border-red-700'
            }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {notificationType === 'success' ? (
                        <svg
                          className="h-5 w-5 text-green-300"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-red-300"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        notificationType === 'success' ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {notification}
                      </p>
                    </div>
                  </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Multi-Platform Manager */}
          <MultiPlatformManager />

            {/* Legacy Twitter Account Component (for backward compatibility) */}
          <div className="backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-outfit font-medium text-white mb-6">
                Twitter Integration (Legacy)
              </h3>
              <TwitterAccount />
            </div>
          </div>

          {/* Account Management Info */}
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-outfit font-semibold text-white mb-2">
              Account Security
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p>• Your Twitter/X tokens are encrypted and stored securely</p>
              <p>• You can disconnect your account at any time</p>
              <p>• We only access your account to post content you create</p>
              <p>• All posting is done with your explicit permission</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
