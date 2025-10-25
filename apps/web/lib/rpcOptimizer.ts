// RPC Optimization strategies
export class RPCOptimizer {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache blockchain events to reduce RPC calls
  static async getCachedEvents(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await fetcher();
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

  // Use smaller block ranges
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
}
