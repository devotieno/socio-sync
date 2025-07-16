interface RateLimitInfo {
  remaining: number;
  reset: number; // Unix timestamp
  limit: number;
}

interface PlatformLimits {
  [key: string]: RateLimitInfo;
}

class RateLimitManager {
  private limits: PlatformLimits = {};
  private queues: { [platform: string]: Array<() => Promise<any>> } = {};
  private processing: { [platform: string]: boolean } = {};

  /**
   * Update rate limit info from API response headers
   */
  updateLimits(platform: string, headers: Headers) {
    const remaining = parseInt(headers.get('x-rate-limit-remaining') || '0');
    const reset = parseInt(headers.get('x-rate-limit-reset') || '0');
    const limit = parseInt(headers.get('x-rate-limit-limit') || '0');

    this.limits[platform] = {
      remaining,
      reset,
      limit
    };

    console.log(`Rate limit updated for ${platform}:`, this.limits[platform]);
  }

  /**
   * Check if we can make a request now
   */
  canMakeRequest(platform: string): boolean {
    const limit = this.limits[platform];
    if (!limit) return true; // No limit info yet, allow request

    if (limit.remaining <= 0) {
      const now = Math.floor(Date.now() / 1000);
      if (now < limit.reset) {
        return false; // Still in rate limit window
      }
    }

    return true;
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   */
  getResetTime(platform: string): number {
    const limit = this.limits[platform];
    if (!limit) return 0;

    const now = Math.floor(Date.now() / 1000);
    const resetTime = (limit.reset - now) * 1000;
    return Math.max(0, resetTime);
  }

  /**
   * Add request to queue if rate limited
   */
  async queueRequest<T>(
    platform: string, 
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.canMakeRequest(platform)) {
      return requestFn();
    }

    // Add to queue
    return new Promise((resolve, reject) => {
      if (!this.queues[platform]) {
        this.queues[platform] = [];
      }

      this.queues[platform].push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue(platform);
    });
  }

  /**
   * Process queued requests when rate limit resets
   */
  private async processQueue(platform: string) {
    if (this.processing[platform]) return;
    this.processing[platform] = true;

    const resetTime = this.getResetTime(platform);
    if (resetTime > 0) {
      console.log(`Waiting ${resetTime}ms for ${platform} rate limit reset`);
      setTimeout(() => {
        this.processing[platform] = false;
        this.processQueue(platform);
      }, resetTime);
      return;
    }

    // Process queue
    const queue = this.queues[platform] || [];
    this.queues[platform] = [];

    for (const request of queue) {
      if (!this.canMakeRequest(platform)) {
        // Re-queue remaining requests
        this.queues[platform] = [request, ...this.queues[platform]];
        break;
      }

      try {
        await request();
      } catch (error) {
        console.error(`Queued request failed for ${platform}:`, error);
      }
    }

    this.processing[platform] = false;
  }

  /**
   * Get current rate limit status
   */
  getStatus(platform: string) {
    const limit = this.limits[platform];
    if (!limit) return null;

    return {
      remaining: limit.remaining,
      limit: limit.limit,
      resetTime: this.getResetTime(platform),
      queueLength: this.queues[platform]?.length || 0
    };
  }
}

export const rateLimitManager = new RateLimitManager();
