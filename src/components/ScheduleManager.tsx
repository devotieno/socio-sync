'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';

export default function ScheduleManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastManualResult, setLastManualResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isServiceRunning, 
    lastProcessedResult, 
    startService, 
    stopService 
  } = useScheduledPosts();

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
          Process scheduled posts that are due for publishing. In production, this would be handled by a cron job.
        </p>
      </div>
      <div className="p-6 space-y-4">
        {/* Auto-processing service status */}
        <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Automatic Processing Service</h3>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isServiceRunning 
                ? 'bg-green-900/50 text-green-400 border border-green-700/50' 
                : 'bg-red-900/50 text-red-400 border border-red-700/50'
            }`}>
              {isServiceRunning ? 'Running' : 'Stopped'}
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-3">
            {isServiceRunning 
              ? 'Automatically checking for scheduled posts every minute.'
              : 'Service is stopped. Scheduled posts will not be published automatically.'
            }
          </p>
          <div className="flex gap-2">
            <button
              onClick={startService}
              disabled={isServiceRunning}
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:shadow-lg hover:shadow-white/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-sm"
            >
              Start Auto-Processing
            </button>
            <button
              onClick={stopService}
              disabled={!isServiceRunning}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Stop Auto-Processing
            </button>
          </div>
        </div>

        {/* Manual controls */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white">Manual Controls</h3>
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

        {/* Auto-processing results */}
        {lastProcessedResult && (
          <div className={`p-4 rounded-lg border ${
            lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited')
              ? 'bg-yellow-900/30 border-yellow-700/50'
              : 'bg-green-900/30 border-green-700/50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited')
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}>
              Last Auto-Processing Result:
            </h3>
            
            {/* Rate limit warning */}
            {lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited') && (
              <div className="mb-3 p-2 bg-yellow-900/50 border border-yellow-700/50 rounded text-yellow-400 text-sm">
                ⚠️ Some posts hit Twitter rate limits. The service will automatically retry with longer intervals.
              </div>
            )}
            
            <pre className={`text-sm overflow-auto ${
              lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited')
                ? 'text-yellow-300'
                : 'text-green-300'
            }`}>
              {JSON.stringify(lastProcessedResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Manual processing results */}
        {lastManualResult && (
          <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-white">Manual Operation Result:</h3>
            <pre className="text-sm overflow-auto text-slate-300">
              {JSON.stringify(lastManualResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
