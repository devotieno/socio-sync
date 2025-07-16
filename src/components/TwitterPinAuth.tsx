'use client';

import React, { useState } from 'react';
import { FaTwitter, FaTimes, FaExternalLinkAlt, FaCopy, FaCheck } from 'react-icons/fa';

interface TwitterPinAuthProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwitterPinAuth({ isOpen, onClose, onSuccess }: TwitterPinAuthProps) {
  const [step, setStep] = useState<'initiate' | 'pin'>('initiate');
  const [authData, setAuthData] = useState<{
    authUrl: string;
    requestToken: string;
    requestTokenSecret: string;
  } | null>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const initiateAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/twitter/pin-auth/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate authentication');
      }

      setAuthData({
        authUrl: data.authUrl,
        requestToken: data.requestToken,
        requestTokenSecret: data.requestTokenSecret,
      });
      setStep('pin');
    } catch (err) {
      console.error('Error initiating Twitter auth:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const completeAuth = async () => {
    if (!authData || !pin.trim()) {
      setError('Please enter the PIN from Twitter');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/twitter/pin-auth/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestToken: authData.requestToken,
          requestTokenSecret: authData.requestTokenSecret,
          pin: pin.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Success - close modal and refresh accounts
      handleClose();
      onSuccess();
    } catch (err) {
      console.error('Error completing Twitter auth:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('initiate');
    setAuthData(null);
    setPin('');
    setError(null);
    setCopied(false);
    onClose();
  };

  const openTwitterAuth = () => {
    if (authData?.authUrl) {
      window.open(authData.authUrl, '_blank');
    }
  };

  const copyAuthUrl = async () => {
    if (authData?.authUrl) {
      try {
        await navigator.clipboard.writeText(authData.authUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaTwitter className="text-blue-500 text-2xl mr-3" />
            <h3 className="text-lg font-semibold">Real Twitter Authentication</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {step === 'initiate' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              This will use Twitter's official authentication system. You'll get a PIN to enter here to securely connect your account.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-xs">
                <strong>How it works:</strong>
                <br />1. We'll generate a secure Twitter authentication link
                <br />2. You'll visit Twitter to authorize our app
                <br />3. Twitter will give you a PIN code
                <br />4. Enter the PIN here to complete the connection
              </p>
            </div>

            <button
              onClick={initiateAuth}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                'Generating auth link...'
              ) : (
                <>
                  <FaTwitter className="mr-2" />
                  Start Twitter Authentication
                </>
              )}
            </button>
          </div>
        )}

        {step === 'pin' && authData && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                Step 1: Visit Twitter to get your PIN
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={openTwitterAuth}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 flex items-center justify-center"
                >
                  <FaExternalLinkAlt className="mr-2" />
                  Open Twitter Auth
                </button>
                <button
                  onClick={copyAuthUrl}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center"
                  title="Copy URL"
                >
                  {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                </button>
              </div>
              <p className="text-yellow-700 text-xs mt-2">
                After authorizing, Twitter will show you a PIN code
              </p>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                Step 2: Enter the PIN from Twitter
              </label>
              <input
                type="text"
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                placeholder="1234567"
                maxLength={7}
                disabled={isLoading}
              />
              <p className="text-gray-500 text-xs mt-1">
                Enter the 7-digit PIN code from Twitter
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={completeAuth}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !pin.trim()}
              >
                {isLoading ? 'Connecting...' : 'Connect Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
