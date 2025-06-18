import { responseCache } from './cache';
import { CoreMessage } from '@/types';

/**
 * AIPerformanceMonitor provides utilities for monitoring and optimizing AI service performance
 */
export class AIPerformanceMonitor {
  private requestTimes: number[] = [];
  private tokenCounts: number[] = [];
  private errorCounts: Record<string, number> = {};
  private modelUsage: Record<string, number> = {};
  
  /**
   * Records the start of an AI request
   * @returns A function to call when the request completes
   */
  startRequest(model: string) {
    const startTime = Date.now();
    
    // Track model usage
    this.modelUsage[model] = (this.modelUsage[model] || 0) + 1;
    
    return {
      complete: (tokenCount?: number) => {
        const duration = Date.now() - startTime;
        this.requestTimes.push(duration);
        
        if (tokenCount) {
          this.tokenCounts.push(tokenCount);
        }
        
        return {
          duration,
          tokenCount
        };
      },
      error: (errorType: string) => {
        this.errorCounts[errorType] = (this.errorCounts[errorType] || 0) + 1;
      }
    };
  }
  
  /**
   * Gets performance statistics
   */
  getStats() {
    const avgResponseTime = this.requestTimes.length > 0
      ? this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length
      : 0;
      
    const avgTokenCount = this.tokenCounts.length > 0
      ? this.tokenCounts.reduce((a, b) => a + b, 0) / this.tokenCounts.length
      : 0;
      
    const totalErrors = Object.values(this.errorCounts).reduce((a, b) => a + b, 0);
    
    const cacheStats = responseCache.getStats();
    
    return {
      requests: {
        total: this.requestTimes.length,
        averageResponseTime: avgResponseTime,
        averageTokenCount: avgTokenCount,
        errors: totalErrors,
        errorBreakdown: this.errorCounts,
        modelUsage: this.modelUsage
      },
      cache: cacheStats
    };
  }
  
  /**
   * Optimizes a request by potentially using cached responses
   * @param messages The messages to send to the AI
   * @param makeRequest A function that makes the actual AI request
   * @param options Configuration options
   */
  async optimizeRequest<T>(
    messages: CoreMessage[], 
    makeRequest: () => Promise<T>,
    options: {
      bypassCache?: boolean;
      ttl?: number;
      model?: string;
    } = {}
  ): Promise<T> {
    // Check cache first unless bypassed
    if (!options.bypassCache) {
      const cachedResponse = responseCache.get(messages);
      if (cachedResponse) {
        return JSON.parse(cachedResponse) as T;
      }
    }
    
    // No cache hit, make the actual request
    const requestTracker = this.startRequest(options.model || 'default');
    
    try {
      const response = await makeRequest();
      
      // Cache the response
      const responseJson = JSON.stringify(response);
      responseCache.set(
        messages, 
        responseJson, 
        options.ttl,
        { 
          model: options.model,
          responseTime: requestTracker.complete().duration 
        }
      );
      
      return response;
    } catch (error) {
      requestTracker.error(error instanceof Error ? error.message : 'unknown');
      throw error;
    }
  }
  
  /**
   * Invalidates cache entries by tags
   */
  invalidateCache(tags: string[]) {
    responseCache.invalidateByTags(tags);
  }
  
  /**
   * Clears all performance metrics
   */
  clearMetrics() {
    this.requestTimes = [];
    this.tokenCounts = [];
    this.errorCounts = {};
    this.modelUsage = {};
  }
}

export const aiPerformance = new AIPerformanceMonitor();