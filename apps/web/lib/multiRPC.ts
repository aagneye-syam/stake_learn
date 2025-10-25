// Multiple RPC provider fallback system
export class MultiRPCProvider {
  private static providers = [
    process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA,
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura
    'https://rpc.sepolia.org', // Public Sepolia RPC
    'https://sepolia.gateway.tenderly.co', // Tenderly
  ].filter(Boolean);

  private static currentIndex = 0;

  static async makeRequest(method: string, params: any[] = []) {
    const maxRetries = this.providers.length;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const provider = this.providers[this.currentIndex];
      
      try {
        const response = await fetch(provider, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id: 1
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }

        return data.result;
      } catch (error) {
        console.warn(`RPC attempt ${attempt + 1} failed:`, error);
        
        // Switch to next provider
        this.currentIndex = (this.currentIndex + 1) % this.providers.length;
        
        if (attempt === maxRetries - 1) {
          throw new Error('All RPC providers failed');
        }
      }
    }
  }

  static getCurrentProvider() {
    return this.providers[this.currentIndex];
  }
}
