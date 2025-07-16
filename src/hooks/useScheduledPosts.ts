import { useEffect, useState } from 'react';
import { scheduledPostsService } from '@/lib/scheduled-posts-service';

export function useScheduledPosts() {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [lastProcessedResult, setLastProcessedResult] = useState<any>(null);

  useEffect(() => {
    // Check initial state
    setIsServiceRunning(scheduledPostsService.isServiceRunning());

    // Listen for scheduled posts processing results
    const handleScheduledPostsProcessed = (event: CustomEvent) => {
      setLastProcessedResult(event.detail);
    };

    window.addEventListener('scheduledPostsProcessed', handleScheduledPostsProcessed as EventListener);

    return () => {
      window.removeEventListener('scheduledPostsProcessed', handleScheduledPostsProcessed as EventListener);
    };
  }, []);

  const startService = () => {
    scheduledPostsService.start();
    setIsServiceRunning(true);
  };

  const stopService = () => {
    scheduledPostsService.stop();
    setIsServiceRunning(false);
  };

  return {
    isServiceRunning,
    lastProcessedResult,
    startService,
    stopService,
  };
}
