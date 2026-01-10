'use client';

import React, { useState, useEffect } from 'react';

interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetTime: number;
  queueLength: number;
}

interface RateLimitDisplayProps {
  className?: string;
}

export function RateLimitDisplay({ className = '' }: RateLimitDisplayProps) {
  const [rateLimits, setRateLimits] = useState<{ [key: string]: RateLimitStatus | null }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRateLimits();
    const interval = setInterval(fetchRateLimits, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRateLimits = async () => {
    try {
      const response = await fetch('/api/rate-limits');
      const data = await response.json();
      
      if (data.success) {
        setRateLimits(data.rateLimits);
      }
    } catch (error) {
      console.error('Failed to fetch rate limits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResetTime = (resetTime: number) => {
    if (resetTime <= 0) return 'Available';
    
    const minutes = Math.ceil(resetTime / (1000 * 60));
    return `${minutes}m`;
  };

  const getStatusColor = (status: RateLimitStatus | null) => {
    if (!status) return 'text-slate-500';
    
    const percentage = status.remaining / status.limit;
    if (percentage > 0.5) return 'text-green-400';
    if (percentage > 0.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const platforms = [
    { key: 'twitter', name: 'X (Twitter)', icon: '𝕏' }
  ];

  if (isLoading) {
    return (
      <div className={`backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 p-4 ${className}`}>
        <h3 className="text-sm font-outfit font-semibold text-white mb-2">X API Rate Limits</h3>
        <div className="animate-pulse space-y-2">
          {platforms.map(platform => (
            <div key={platform.key} className="flex justify-between">
              <div className="h-4 bg-slate-700 rounded w-20"></div>
              <div className="h-4 bg-slate-700 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-outfit font-semibold text-white">X API Rate Limits</h3>
        <button 
          onClick={fetchRateLimits}
          className="text-xs text-white hover:text-slate-300 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-2">
        {platforms.map(platform => {
          const status = rateLimits[platform.key];
          return (
            <div key={platform.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{platform.icon}</span>
                <span className="text-slate-300">{platform.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {status ? (
                  <>
                    <span className={getStatusColor(status)}>
                      {status.remaining}/{status.limit}
                    </span>
                    {status.resetTime > 0 && (
                      <span className="text-xs text-slate-500">
                        ({formatResetTime(status.resetTime)})
                      </span>
                    )}
                    {status.queueLength > 0 && (
                      <span className="bg-orange-900/50 text-orange-300 border border-orange-700 text-xs px-1 rounded">
                        {status.queueLength} queued
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500 text-xs">Unknown</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t border-slate-700/50 text-xs text-slate-400">
        <p>Rate limits reset every 15 minutes</p>
      </div>
    </div>
  );
}
