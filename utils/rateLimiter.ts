interface RateLimitConfig {
  requests: number;
  window: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits: Record<string, RateLimitConfig> = {
    openrouter: { requests: 200, window: 60000 }, // 200 requests per minute
    perplexity: { requests: 100, window: 60000 }   // 100 requests per minute
  };
  
  canMakeRequest(service: 'openrouter' | 'perplexity', userId?: string): boolean {
    const key = `${service}_${userId || 'anonymous'}`;
    const now = Date.now();
    const limit = this.limits[service];
    
    if (!limit) return true;
    
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < limit.window);
    
    if (validRequests.length >= limit.requests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  getRemainingRequests(service: 'openrouter' | 'perplexity', userId?: string): number {
    const key = `${service}_${userId || 'anonymous'}`;
    const now = Date.now();
    const limit = this.limits[service];
    
    if (!limit) return Infinity;
    
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < limit.window);
    
    return Math.max(0, limit.requests - validRequests.length);
  }
  
  getResetTime(service: 'openrouter' | 'perplexity', userId?: string): number {
    const key = `${service}_${userId || 'anonymous'}`;
    const requests = this.requests.get(key) || [];
    
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const limit = this.limits[service];
    
    return oldestRequest + limit.window;
  }
}

export const rateLimiter = new RateLimiter();