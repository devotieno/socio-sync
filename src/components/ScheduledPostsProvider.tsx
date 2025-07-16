'use client';

import { useEffect } from 'react';
import { scheduledPostsService } from '@/lib/scheduled-posts-service';

export default function ScheduledPostsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Auto-start the service when the app loads
    scheduledPostsService.start();
    
    return () => {
      // Clean up when component unmounts
      scheduledPostsService.stop();
    };
  }, []);

  return <>{children}</>;
}
