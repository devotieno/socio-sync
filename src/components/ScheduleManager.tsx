'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ScheduleManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastManualResult, setLastManualResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const processScheduledPosts = async () => {
    setIsProcessing(true);
    setError(null);
    setLastManualResult(null);

    try {
      const response = await fetch('/api/posts/publish-scheduled', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer dev-cron-key-12345`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setLastManualResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkScheduledPosts = async () => {
    try {
      const response = await fetch('/api/posts/publish-scheduled', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setLastManualResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-lg shadow-black/20">
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h2 className="text-xl font-outfit font-semibold text-white">Scheduled Posts Manager</h2>
        <p className="text-sm text-slate-400 mt-1">
          Your scheduled posts are automatically published by GitHub Actions every 5 minutes.
        </p>
      </div>
      <div className="p-6 space-y-4">
        {/* Auto-processing status */}
        <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Automatic Processing</h3>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Active
            </div>
          </div>
          <p className="text-sm text-slate-300">
            GitHub Actions checks for scheduled posts every 5 minutes and publishes them automatically. No manual action required!
          </p>
        </div>

        {/* Manual controls */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Manual Controls</h3>
          <p className="text-sm text-slate-400 mb-3">
            Use these buttons to manually check or publish scheduled posts if needed.
          </p>
          <div className="flex gap-2">
            <button
              onClick={checkScheduledPosts}
              disabled={isProcessing}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Due Posts
            </button>
            <button
              onClick={processScheduledPosts}
              disabled={isProcessing}
              className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-white/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isProcessing ? 'Processing...' : 'Process Now'}
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/50 bg-red-950/30 rounded-lg p-4">
            <div className="text-red-400">
              Error: {error}
            </div>
          </div>
        )}

        {/* Manual processing results */}
        {lastManualResult && (
          <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-white">Operation Result:</h3>
            <pre className="text-sm overflow-auto text-slate-300">
              {JSON.stringify(lastManualResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
