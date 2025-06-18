interface CacheEntry {
  response: string;
  timestamp: number;
  ttl: number;
  tags: string[];
  semanticKey?: string;
  metadata?: {
    model?: string;
    tokenCount?: number;
    responseTime?: number;
  };
}

interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  semanticThreshold: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private semanticIndex = new Map<string, string[]>();
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    totalRequests: number;
    averageResponseTime: number[];
  };
  
  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: config?.maxSize || 100, // Maximum number of cached responses
      defaultTtl: config?.defaultTtl || 300000, // 5 minutes default
      semanticThreshold: config?.semanticThreshold || 0.7,
    };
    
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      averageResponseTime: [],
    };
  }
  
  private generateKey(messages: any[]): string {
    // Only use the last few messages for the key to avoid overly specific keys
    const relevantMessages = messages.slice(-3);
    const content = relevantMessages.map(m => 
      `${m.role}:${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`
    ).join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Extracts tags from messages for categorization
   */
  private extractTags(messages: any[]): string[] {
    const tags: string[] = [];
    const lastMessage = messages[messages.length - 1];
    const content = typeof lastMessage.content === 'string' ? lastMessage.content : '';

    // Extract potential tags from content
    if (content.includes('weather')) tags.push('weather');
    if (content.includes('news')) tags.push('news');
    if (content.includes('stock')) tags.push('finance');
    if (content.includes('task') || content.includes('todo')) tags.push('task');
    if (content.includes('schedule') || content.includes('plan')) tags.push('planning');
    if (content.includes('remind')) tags.push('reminder');
    
    // Add message type as tag
    if (lastMessage.role) tags.push(lastMessage.role);
    
    return tags;
  }
  
  get(messages: any[]): string | null {
    const startTime = Date.now();
    this.stats.totalRequests++;
    
    const key = this.generateKey(messages);
    const entry = this.cache.get(key);
    
    if (entry) {
      // Check if entry has expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.misses++;
        this.stats.averageResponseTime.push(Date.now() - startTime);
        return null;
      }
      
      // Direct cache hit
      this.stats.hits++;
      this.stats.averageResponseTime.push(Date.now() - startTime);
      return entry.response;
    }
    
    // Try to find similar response if no direct hit
    const similarEntry = this.findSimilarResponse(messages);
    if (similarEntry) {
      this.stats.hits++;
      this.stats.averageResponseTime.push(Date.now() - startTime);
      return similarEntry.response;
    }
    
    this.stats.misses++;
    this.stats.averageResponseTime.push(Date.now() - startTime);
    return null;
  }
  
  /**
   * Finds a similar response using semantic similarity
   */
  private findSimilarResponse(messages: any[]): CacheEntry | null {
    const key = this.generateKey(messages);
    const similarKeys = this.semanticIndex.get(key) || [];
    
    for (const similarKey of similarKeys) {
      const entry = this.cache.get(similarKey);
      if (entry && (Date.now() - entry.timestamp <= entry.ttl)) {
        return entry;
      }
    }
    
    return null;
  }
  
  set(
    messages: any[], 
    response: string, 
    ttl?: number,
    metadata?: CacheEntry['metadata']
  ): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const key = this.generateKey(messages);
    const tags = this.extractTags(messages);
    const dynamicTtl = ttl || this.calculateDynamicTTL(response, tags);
    
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl: dynamicTtl,
      tags,
      metadata: metadata || {}
    });
    
    this.updateSemanticIndex(key, messages, response);
  }
  
  /**
   * Calculates a dynamic TTL based on content type and quality
   */
  private calculateDynamicTTL(content: string, tags: string[]): number {
    // Current information expires quickly
    if (tags.includes('news') || tags.includes('weather') || tags.includes('finance')) {
      return 1000 * 60 * 30; // 30 minutes
    }
    
    // Task-related information has medium lifespan
    if (tags.includes('task') || tags.includes('planning') || tags.includes('reminder')) {
      return 1000 * 60 * 60 * 2; // 2 hours
    }
    
    // General knowledge has longer lifespan
    return this.config.defaultTtl;
  }
  
  /**
   * Updates the semantic index with new entries
   */
  private updateSemanticIndex(key: string, messages: any[], response: string): void {
    // In a real implementation, this would use embeddings or other semantic similarity
    // For now, we'll use a simple approach based on content overlap
    const lastMessage = messages[messages.length - 1];
    const content = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    // Find existing keys with similar content
    for (const [existingKey, similarKeys] of this.semanticIndex.entries()) {
      const existingEntry = this.cache.get(existingKey);
      if (!existingEntry) continue;
      
      // Simple word overlap calculation
      const existingContent = existingEntry.response.toLowerCase();
      const matchCount = words.filter(word => existingContent.includes(word)).length;
      const similarity = words.length > 0 ? matchCount / words.length : 0;
      
      if (similarity > this.config.semanticThreshold) {
        // Add bidirectional relationship
        if (!similarKeys.includes(key)) {
          similarKeys.push(key);
        }
        
        const currentSimilarKeys = this.semanticIndex.get(key) || [];
        if (!currentSimilarKeys.includes(existingKey)) {
          currentSimilarKeys.push(existingKey);
          this.semanticIndex.set(key, currentSimilarKeys);
        }
      }
    }
    
    // Initialize entry if it doesn't exist
    if (!this.semanticIndex.has(key)) {
      this.semanticIndex.set(key, []);
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Invalidates cache entries by tags
   */
  invalidateByTags(tags: string[]): void {
    for (const key of this.cache.keys()) {
      const entry = this.cache.get(key);
      if (entry && tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }
  
  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const validEntries = entries.filter(entry => now - entry.timestamp <= entry.ttl);
    
    const hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
      
    const avgResponseTime = this.stats.averageResponseTime.length > 0
      ? this.stats.averageResponseTime.reduce((a, b) => a + b, 0) / this.stats.averageResponseTime.length
      : 0;
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      avgAge: validEntries.length > 0 
        ? validEntries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / validEntries.length 
        : 0,
      hitRate,
      averageResponseTime: avgResponseTime,
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests: this.stats.totalRequests,
    };
  }
}

export const responseCache = new ResponseCache();