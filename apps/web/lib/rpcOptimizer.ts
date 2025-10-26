// RPC Optimization strategies to handle rate limits and block range restrictions
export class RPCOptimizer {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static MAX_RETRIES = 3;
  private static RETRY_DELAY = 1000; // 1 second
  private static REQUEST_COUNTER = new Map<string, number>();
  private static MAX_REQUESTS_PER_MINUTE = 10; // Circuit breaker
  private static REQUEST_WINDOW = 60 * 1000; // 1 minute

  // Cache blockchain events to reduce RPC calls
  static async getCachedEvents(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(key)) {
      console.warn(`Circuit breaker open for ${key}, using cached data or returning empty`);
      if (cached) {
        return cached.data;
      }
      return []; // Return empty array instead of making request
    }

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`Using cached data for ${key}`);
      return cached.data;
    }

    // Increment request counter
    this.incrementRequestCounter(key);

    try {
      const data = await this.retryWithBackoff(fetcher);
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.warn('RPC failed, using cached data:', error);
        return cached.data;
      }
      throw error;
    }
  }

  // Circuit breaker logic
  private static isCircuitBreakerOpen(key: string): boolean {
    const now = Date.now();
    const requestCount = this.REQUEST_COUNTER.get(key) || 0;
    
    // Reset counter if window has passed
    if (now - (this.REQUEST_COUNTER.get(`${key}_timestamp`) || 0) > this.REQUEST_WINDOW) {
      this.REQUEST_COUNTER.set(key, 0);
      this.REQUEST_COUNTER.set(`${key}_timestamp`, now);
      return false;
    }
    
    return requestCount >= this.MAX_REQUESTS_PER_MINUTE;
  }

  // Increment request counter
  private static incrementRequestCounter(key: string): void {
    const now = Date.now();
    const currentCount = this.REQUEST_COUNTER.get(key) || 0;
    const lastReset = this.REQUEST_COUNTER.get(`${key}_timestamp`) || now;
    
    // Reset if window has passed
    if (now - lastReset > this.REQUEST_WINDOW) {
      this.REQUEST_COUNTER.set(key, 1);
      this.REQUEST_COUNTER.set(`${key}_timestamp`, now);
    } else {
      this.REQUEST_COUNTER.set(key, currentCount + 1);
    }
  }

  // Retry with exponential backoff
  private static async retryWithBackoff(fetcher: () => Promise<any>, attempt = 1): Promise<any> {
    try {
      return await fetcher();
    } catch (error: any) {
      if (attempt >= this.MAX_RETRIES) {
        throw error;
      }

      // Check if it's a rate limit error
      if (error.code === 429 || error.message?.includes('rate limit') || error.message?.includes('exceeded')) {
        const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${this.MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fetcher, attempt + 1);
      }

      // Check if it's a block range error
      if (error.message?.includes('block range') || error.message?.includes('10 block range')) {
        console.log('Block range too large, reducing range...');
        // This will be handled by the caller
        throw error;
      }

      throw error;
    }
  }

  // Use smaller block ranges for free tier
  static getOptimalBlockRange(fromBlock: number, toBlock: number) {
    const MAX_RANGE = 10; // Free tier limit
    const range = toBlock - fromBlock;
    
    if (range <= MAX_RANGE) {
      return { fromBlock, toBlock };
    }

    // Split into smaller chunks
    const chunks = [];
    for (let start = fromBlock; start <= toBlock; start += MAX_RANGE) {
      const end = Math.min(start + MAX_RANGE - 1, toBlock);
      chunks.push({ fromBlock: start, toBlock: end });
    }
    return chunks;
  }

  // Batch multiple requests into one
  static async batchRequests(requests: Array<() => Promise<any>>) {
    try {
      return await Promise.all(requests);
    } catch (error) {
      console.warn('Batch request failed, trying individual requests');
      // Fallback to individual requests
      const results = [];
      for (const request of requests) {
        try {
          results.push(await request());
        } catch (err) {
          results.push(null);
        }
      }
      return results;
    }
  }

  // Clear cache and reset circuit breaker
  static clearCache() {
    this.cache.clear();
    this.REQUEST_COUNTER.clear();
    console.log('Cache and circuit breaker cleared');
  }

  // Reset circuit breaker for specific key
  static resetCircuitBreaker(key: string) {
    this.REQUEST_COUNTER.delete(key);
    this.REQUEST_COUNTER.delete(`${key}_timestamp`);
    console.log(`Circuit breaker reset for ${key}`);
  }

  // Get cache stats
  static getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}