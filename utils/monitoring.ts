interface APIMetrics {
  requests: number;
  errors: number;
  totalResponseTime: number;
  avgResponseTime: number;
  lastError?: string;
  lastErrorTime?: number;
}

export class APIMonitor {
  private metrics: Record<string, APIMetrics> = {
    openrouter: { requests: 0, errors: 0, totalResponseTime: 0, avgResponseTime: 0 },
    perplexity: { requests: 0, errors: 0, totalResponseTime: 0, avgResponseTime: 0 }
  };
  
  recordRequest(
    service: 'openrouter' | 'perplexity', 
    responseTime: number, 
    success: boolean,
    error?: string
  ) {
    const metric = this.metrics[service];
    metric.requests++;
    metric.totalResponseTime += responseTime;
    metric.avgResponseTime = metric.totalResponseTime / metric.requests;
    
    if (!success) {
      metric.errors++;
      metric.lastError = error;
      metric.lastErrorTime = Date.now();
    }
  }
  
  getHealthStatus() {
    return Object.entries(this.metrics).map(([service, metric]) => ({
      service,
      requests: metric.requests,
      errorRate: metric.requests > 0 ? metric.errors / metric.requests : 0,
      avgResponseTime: metric.avgResponseTime,
      status: this.getServiceStatus(metric),
      lastError: metric.lastError,
      lastErrorTime: metric.lastErrorTime
    }));
  }
  
  private getServiceStatus(metric: APIMetrics): 'healthy' | 'degraded' | 'down' {
    if (metric.requests === 0) return 'healthy';
    
    const errorRate = metric.errors / metric.requests;
    const isRecentError = metric.lastErrorTime && (Date.now() - metric.lastErrorTime) < 300000; // 5 minutes
    
    if (errorRate > 0.5 || (errorRate > 0.1 && isRecentError)) {
      return 'down';
    } else if (errorRate > 0.1 || metric.avgResponseTime > 10000) {
      return 'degraded';
    }
    
    return 'healthy';
  }
  
  getMetrics(service?: 'openrouter' | 'perplexity') {
    if (service) {
      return this.metrics[service];
    }
    return this.metrics;
  }
  
  reset() {
    this.metrics = {
      openrouter: { requests: 0, errors: 0, totalResponseTime: 0, avgResponseTime: 0 },
      perplexity: { requests: 0, errors: 0, totalResponseTime: 0, avgResponseTime: 0 }
    };
  }
}

export const apiMonitor = new APIMonitor();