interface CacheEntry {
  response: string;
  timestamp: number;
  ttl: number;
  metadata?: {
    model?: string;
    tokenCount?: number;
    responseTime?: number;
  };
}

class ResponseCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100; // Maximum number of cached responses
  
  private generateKey(messages: any[]): string {
    // Create a hash of the messages for caching
    const content = messages.map(m => 
      typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
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
  
  get(messages: any[]): string | null {
    const key = this.generateKey(messages);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.response;
  }
  
  set(
    messages: any[], 
    response: string, 
    ttl: number = 300000, // 5 minutes default
    metadata?: CacheEntry['metadata']
  ): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    const key = this.generateKey(messages);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl,
      metadata
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const validEntries = entries.filter(entry => now - entry.timestamp <= entry.ttl);
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      avgAge: validEntries.length > 0 
        ? validEntries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / validEntries.length 
        : 0
    };
  }
}

export const responseCache = new ResponseCache();