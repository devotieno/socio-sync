'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ScheduledPostsNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const handleScheduledPostsProcessed = (event: CustomEvent) => {
      const result = event.detail;
      if (result.processed > 0) {
        const notification = {
          id: Date.now(),
          message: `✅ ${result.processed} scheduled post${result.processed > 1 ? 's' : ''} published automatically!`,
          timestamp: new Date(),
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5
        
        // Remove notification after 10 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 10000);
      }
    };

    window.addEventListener('scheduledPostsProcessed', handleScheduledPostsProcessed as EventListener);

    return () => {
      window.removeEventListener('scheduledPostsProcessed', handleScheduledPostsProcessed as EventListener);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Alert key={notification.id} className="bg-green-50 border-green-200 max-w-sm shadow-lg">
          <AlertDescription className="text-green-800">
            {notification.message}
            <div className="text-xs text-green-600 mt-1">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
