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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Scheduled Posts Manager</CardTitle>
        <p className="text-sm text-gray-600">
          Process scheduled posts that are due for publishing. In production, this would be handled by a cron job.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-processing service status */}
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">Automatic Processing Service</h3>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isServiceRunning 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isServiceRunning ? 'Running' : 'Stopped'}
            </div>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            {isServiceRunning 
              ? 'Automatically checking for scheduled posts every minute.'
              : 'Service is stopped. Scheduled posts will not be published automatically.'
            }
          </p>
          <div className="flex gap-2">
            <Button
              onClick={startService}
              disabled={isServiceRunning}
              size="sm"
              variant="outline"
            >
              Start Auto-Processing
            </Button>
            <Button
              onClick={stopService}
              disabled={!isServiceRunning}
              size="sm"
              variant="outline"
            >
              Stop Auto-Processing
            </Button>
          </div>
        </div>

        {/* Manual controls */}
        <div className="space-y-2">
          <h3 className="font-semibold">Manual Controls</h3>
          <div className="flex gap-2">
            <Button
              onClick={checkScheduledPosts}
              variant="outline"
              disabled={isProcessing}
            >
              Check Due Posts
            </Button>
            <Button
              onClick={processScheduledPosts}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Process Now'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              Error: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-processing results */}
        {lastProcessedResult && (
          <div className={`p-4 rounded-md ${
            lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited')
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-green-50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited')
                ? 'text-yellow-800'
                : 'text-green-800'
            }`}>
              Last Auto-Processing Result:
            </h3>
            
            {/* Rate limit warning */}
            {lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited') && (
              <div className="mb-3 p-2 bg-yellow-100 rounded text-yellow-800 text-sm">
                ⚠️ Some posts hit Twitter rate limits. The service will automatically retry with longer intervals.
              </div>
            )}
            
            <pre className={`text-sm overflow-auto ${
              lastProcessedResult.results?.some((r: any) => r.status === 'rate_limited')
                ? 'text-yellow-700'
                : 'text-green-700'
            }`}>
              {JSON.stringify(lastProcessedResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Manual processing results */}
        {lastManualResult && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Manual Operation Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(lastManualResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
