// Local blockchain event storage to reduce RPC calls
export class LocalBlockchain {
  private static events = new Map<string, any[]>();
  private static lastSyncBlock = 0;

  // Store events locally to avoid repeated RPC calls
  static storeEvents(contractAddress: string, events: any[]) {
    const key = contractAddress.toLowerCase();
    const existing = this.events.get(key) || [];
    this.events.set(key, [...existing, ...events]);
  }

  // Get events from local storage first
  static getEvents(contractAddress: string, fromBlock: number, toBlock: number) {
    const key = contractAddress.toLowerCase();
    const allEvents = this.events.get(key) || [];
    
    return allEvents.filter(event => {
      const blockNumber = parseInt(event.blockNumber, 16);
      return blockNumber >= fromBlock && blockNumber <= toBlock;
    });
  }

  // Sync with blockchain only when needed
  static async syncEvents(contractAddress: string, fromBlock: number) {
    if (fromBlock <= this.lastSyncBlock) {
      return this.getEvents(contractAddress, fromBlock, this.lastSyncBlock);
    }

    // Only fetch new events
    try {
      const newEvents = await this.fetchNewEvents(contractAddress, this.lastSyncBlock + 1);
      this.storeEvents(contractAddress, newEvents);
      this.lastSyncBlock = Math.max(this.lastSyncBlock, ...newEvents.map(e => parseInt(e.blockNumber, 16)));
      return newEvents;
    } catch (error) {
      console.warn('Failed to sync events, using local data:', error);
      return this.getEvents(contractAddress, fromBlock, this.lastSyncBlock);
    }
  }

  private static async fetchNewEvents(contractAddress: string, fromBlock: number) {
    // This would use the MultiRPCProvider
    // For now, return empty array to avoid RPC calls
    console.log(`Would fetch events for ${contractAddress} from block ${fromBlock}`);
    return [];
  }

  // Clear local storage
  static clearStorage() {
    this.events.clear();
    this.lastSyncBlock = 0;
  }

  // Get storage stats
  static getStorageStats() {
    return {
      eventCount: Array.from(this.events.values()).reduce((sum, events) => sum + events.length, 0),
      contractCount: this.events.size,
      lastSyncBlock: this.lastSyncBlock
    };
  }
}