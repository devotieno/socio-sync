import { rateLimitManager } from '@/lib/rate-limit-manager';

export class PostScheduler {
  /**
   * Check if a post can be published immediately across all platforms
   */
  static async canPublishNow(platforms: string[]): Promise<{
    canPublish: boolean;
    blockedPlatforms: string[];
    estimatedWaitTime: number;
  }> {
    const blockedPlatforms: string[] = [];
    let maxWaitTime = 0;

    for (const platform of platforms) {
      if (!rateLimitManager.canMakeRequest(platform)) {
        blockedPlatforms.push(platform);
        const waitTime = rateLimitManager.getResetTime(platform);
        maxWaitTime = Math.max(maxWaitTime, waitTime);
      }
    }

    return {
      canPublish: blockedPlatforms.length === 0,
      blockedPlatforms,
      estimatedWaitTime: maxWaitTime
    };
  }

  /**
   * Calculate optimal posting time to avoid rate limits
   */
  static calculateOptimalPostTime(platforms: string[]): Date {
    let maxResetTime = 0;

    for (const platform of platforms) {
      const resetTime = rateLimitManager.getResetTime(platform);
      maxResetTime = Math.max(maxResetTime, resetTime);
    }

    // Add a 1-minute buffer
    return new Date(Date.now() + maxResetTime + 60000);
  }

  /**
   * Suggest alternative posting strategies when rate limited
   */
  static getSuggestions(platforms: string[]): {
    suggestions: string[];
    alternatives: { text: string; action: string }[];
  } {
    const suggestions: string[] = [];
    const alternatives: { text: string; action: string }[] = [];

    // Check each platform's status
    for (const platform of platforms) {
      if (!rateLimitManager.canMakeRequest(platform)) {
        const resetTime = rateLimitManager.getResetTime(platform);
        const minutes = Math.ceil(resetTime / (1000 * 60));
        
        suggestions.push(
          `${platform.charAt(0).toUpperCase() + platform.slice(1)} rate limit active. Resets in ${minutes} minutes.`
        );
      }
    }

    // Provide alternatives
    if (suggestions.length > 0) {
      alternatives.push(
        { text: 'Schedule for later', action: 'schedule' },
        { text: 'Post to available platforms only', action: 'partial' },
        { text: 'Wait and try again', action: 'wait' },
        { text: 'Upgrade API plan', action: 'upgrade' }
      );
    }

    return { suggestions, alternatives };
  }
}
