'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function DevelopmentNotice() {
  const [isVisible, setIsVisible] = useState(true);

  // Only show in development and when Firebase is not configured
  const showNotice = process.env.NODE_ENV === 'development' && 
                    (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key');

  if (!showNotice || !isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            🔧 Development Mode - Firebase Not Configured
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-2">
              To fully test the application, you need to set up Firebase:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Firebase Console</a></li>
              <li>Enable Authentication, Firestore, and Storage</li>
              <li>Copy your config values to <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
              <li>Restart the development server</li>
            </ol>
            <p className="mt-2 text-xs">
              Until then, the app will run in demo mode with limited functionality.
            </p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-400 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
