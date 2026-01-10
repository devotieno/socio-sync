// Background service to automatically process scheduled posts
class ScheduledPostsService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private checkInterval = 300000; // Start with 5 minutes for development
  private maxInterval = 600000; // Max 10 minutes
  private rateLimitCount = 0;
  private firebaseErrorCount = 0;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Starting scheduled posts service...');
    
    // Check immediately, then set up interval
    this.processScheduledPosts();
    this.scheduleNextCheck();
  }

  private scheduleNextCheck() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }
    
    this.intervalId = setTimeout(async () => {
      if (this.isRunning) {
        await this.processScheduledPosts();
        this.scheduleNextCheck();
      }
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.rateLimitCount = 0;
    this.checkInterval = 60000; // Reset interval
    console.log('Stopped scheduled posts service');
  }

  private async processScheduledPosts() {
    try {
      console.log(`Checking for scheduled posts... (interval: ${this.checkInterval}ms)`);
      
      const response = await fetch('/api/posts/publish-scheduled', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer dev-cron-key-12345',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to process scheduled posts:', response.status, errorText);
        
        // If we get Firebase permission errors, back off significantly
        if (response.status === 500 && errorText.includes('permission')) {
          this.firebaseErrorCount++;
          this.checkInterval = Math.min(this.checkInterval * 2, this.maxInterval);
          console.log(`Firebase permission error #${this.firebaseErrorCount}, backing off to ${this.checkInterval}ms intervals`);
          
          // After 3 consecutive Firebase errors, stop trying for development
          if (this.firebaseErrorCount >= 3) {
            console.log('Too many Firebase permission errors. Pausing scheduled posts service for development.');
            this.stop();
            return;
          }
        }
        
        // If we get API rate limit errors, back off more gently
        if (response.status === 403 || response.status === 401) {
          this.checkInterval = Math.min(this.checkInterval * 1.5, this.maxInterval);
          console.log(`API permission error detected, backing off to ${this.checkInterval}ms intervals`);
        }
        return;
      }

      // Reset error count on success
      this.firebaseErrorCount = 0;

      const result = await response.json();
      
      // Check if any posts hit rate limits
      const rateLimitedPosts = result.results?.filter((r: any) => r.status === 'rate_limited') || [];
      
      if (rateLimitedPosts.length > 0) {
        this.rateLimitCount++;
        // Increase interval when rate limits are hit
        this.checkInterval = Math.min(this.checkInterval * 1.5, this.maxInterval);
        console.log(`Rate limit detected. Increasing check interval to ${this.checkInterval}ms`);
      } else if (this.rateLimitCount > 0) {
        // Decrease interval when no rate limits
        this.rateLimitCount = Math.max(0, this.rateLimitCount - 1);
        if (this.rateLimitCount === 0) {
          this.checkInterval = 60000; // Reset to 1 minute
          console.log('Rate limits cleared. Reset check interval to 60s');
        }
      }
      
      if (result.processed > 0) {
        console.log(`Processed ${result.processed} scheduled posts:`, result.results);
        
        // Dispatch custom event to notify the UI
        window.dispatchEvent(new CustomEvent('scheduledPostsProcessed', { 
          detail: result 
        }));
      }
    } catch (error) {
      console.error('Error processing scheduled posts:', error);
    }
  }

  isServiceRunning() {
    return this.isRunning;
  }
}

// Create singleton instance
export const scheduledPostsService = new ScheduledPostsService();

// Auto-start when module is loaded (only in browser)
if (typeof window !== 'undefined') {
  scheduledPostsService.start();
}
