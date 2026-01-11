'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface LinkedProvidersInfo {
  linkedProviders: string[];
  email: string;
  displayName: string;
}

export default function LinkedAccountsInfo() {
  const { data: session } = useSession();
  const [linkedInfo, setLinkedInfo] = useState<LinkedProvidersInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchLinkedProviders();
    }
  }, [session]);

  const fetchLinkedProviders = async () => {
    try {
      const response = await fetch('/api/auth/linked-providers');
      if (response.ok) {
        const data = await response.json();
        setLinkedInfo(data);
      }
    } catch (error) {
      console.error('Error fetching linked providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !linkedInfo) return null;

  const providers = [
    { id: 'password', name: 'Email/Password', icon: '🔑' },
    { id: 'google', name: 'Google', icon: '🔴' },
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
  ];

  return (
    <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
      <h2 className="text-xl font-outfit font-bold text-white mb-4">Linked Accounts</h2>
      <p className="text-slate-400 text-sm mb-6">
        Manage your sign-in methods. You can use any linked method to access your account.
      </p>
      
      <div className="space-y-3">
        {providers.map((provider) => {
          const isLinked = linkedInfo.linkedProviders?.includes(provider.id);
          
          return (
            <div
              key={provider.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                isLinked
                  ? 'bg-slate-700/30 border-slate-600/50'
                  : 'bg-slate-800/20 border-slate-700/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <div className="font-medium text-white">{provider.name}</div>
                  {isLinked && (
                    <div className="text-xs text-slate-400">{linkedInfo.email}</div>
                  )}
                </div>
              </div>
              
              {isLinked ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Linked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <XCircleIcon className="w-5 h-5" />
                  <span>Not Linked</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> If you sign in with Google or Twitter using the same email address, 
          your accounts will automatically be linked together.
        </p>
      </div>
    </div>
  );
}
