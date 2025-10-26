// Multiple RPC provider fallback system
export class MultiRPCProvider {
  private static providers = [
    'https://ethereum-sepolia.publicnode.com', // PublicNode (working)
    'https://worldchain-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Worldchain Mainnet
    'https://worldchain-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Worldchain Sepolia
    'https://eth-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Ethereum Mainnet
    'https://eth-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Ethereum Sepolia
    'https://base-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Base Mainnet
    'https://base-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Base Sepolia
    'https://arb-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Arbitrum Mainnet
    'https://arb-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Arbitrum Sepolia
    'https://polygon-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Polygon Mainnet
    'https://polygon-mumbai.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Polygon Mumbai
    'https://unichain-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Unichain Mainnet
    'https://unichain-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Unichain Sepolia
    'https://filecoin-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Filecoin Mainnet
    'https://filecoin-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Filecoin Sepolia
    'https://monad-testnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Monad Testnet
    'https://monad-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Monad Mainnet
    'https://solana-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Solana Mainnet
    'https://solana-devnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp', // Solana Devnet
  ].filter(Boolean);

  private static currentIndex = 0;

  static async makeRequest(method: string, params: any[] = []) {
    const maxRetries = this.providers.length;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const provider = this.providers[this.currentIndex];
      
      try {
        console.log(`Trying RPC provider ${this.currentIndex + 1}/${this.providers.length}: ${provider}`);
        
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

        console.log(`RPC request successful with provider ${this.currentIndex + 1}`);
        return data.result;
      } catch (error) {
        console.warn(`RPC attempt ${attempt + 1} failed with provider ${this.currentIndex + 1}:`, error);
        
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

  static getProviderCount() {
    return this.providers.length;
  }
}