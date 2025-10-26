  import { NextRequest, NextResponse } from 'next/server';
  import { ethers } from 'ethers';
  import { RPCOptimizer } from '@/lib/rpcOptimizer';
  import { MultiRPCProvider } from '@/lib/multiRPC';
  import { LocalBlockchain } from '@/lib/localBlockchain';

  // In-memory transaction storage (in production, use a database)
  // Use global variable to persist across Next.js API route reloads in development
  declare global {
    var transactionStorage: Map<string, any[]> | undefined;
  }

  if (!global.transactionStorage) {
    global.transactionStorage = new Map<string, any[]>();
  }

  const transactionStorage = global.transactionStorage;

  // Contract addresses
  const STAKING_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA;
  const DATACOIN_ADDRESS = process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA;

  // StakingManager ABI for events
  const STAKING_ABI = [
    "event Staked(address indexed user, uint256 indexed courseId, uint256 amount)",
    "event CourseCompleted(address indexed user, uint256 indexed courseId, string certificateCID)",
    "event StakeRefunded(address indexed user, uint256 indexed courseId, uint256 amount)"
  ];

  // DataCoin ABI for events
  const DATACOIN_ABI = [
    "event TokensMinted(address indexed to, uint256 amount, string reason)"
  ];

  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const clearCache = searchParams.get('clearCache');

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }

    try {
      // Clear cache if requested
      if (clearCache === 'true') {
        RPCOptimizer.clearCache();
        LocalBlockchain.clearStorage();
        console.log('Cache cleared');
      }

      // Get transactions from storage
      const userTransactions = transactionStorage.get(userAddress) || [];
      
  // If no transactions in storage, try to fetch from contract events
  if (userTransactions.length === 0) {
    // Only fetch if we haven't tried recently (prevent infinite loops)
    const lastFetchKey = `lastFetch_${userAddress}`;
    const lastFetch = (transactionStorage.get(lastFetchKey) || [0])[0];
    const now = Date.now();
    const FETCH_COOLDOWN = 300000; // 5 minute cooldown (increased from 1 minute)
    
    if (now - lastFetch > FETCH_COOLDOWN) {
      // Add a simple flag to prevent concurrent fetches
      const fetchInProgressKey = `fetching_${userAddress}`;
      if (!transactionStorage.get(fetchInProgressKey)) {
        transactionStorage.set(fetchInProgressKey, [true]);
        try {
          await fetchTransactionsFromContracts(userAddress);
          transactionStorage.set(lastFetchKey, [now]);
        } finally {
          transactionStorage.delete(fetchInProgressKey);
        }
      }
    }
    
    const updatedTransactions = transactionStorage.get(userAddress) || [];
    return NextResponse.json({ 
      transactions: updatedTransactions,
      cacheStats: RPCOptimizer.getCacheStats(),
      localStats: LocalBlockchain.getStorageStats()
    });
  }

      return NextResponse.json({ 
        transactions: userTransactions,
        cacheStats: RPCOptimizer.getCacheStats(),
        localStats: LocalBlockchain.getStorageStats()
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
  }

  export async function POST(request: NextRequest) {
    try {
      const { userAddress, type, amount, courseId, hash, timestamp, status } = await request.json();

      if (!userAddress || !type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Create transaction record
      const transaction = {
        hash: hash || `0x${Math.random().toString(16).substring(2, 66)}`,
        type,
        amount: amount || '0',
        courseId: courseId || '0',
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        status: status || 'success',
        blockNumber: Math.floor(Math.random() * 1000000) + 1000000
      };

      // Store transaction
      const userTransactions = transactionStorage.get(userAddress) || [];
      userTransactions.push(transaction);
      transactionStorage.set(userAddress, userTransactions);

      return NextResponse.json({ success: true, transaction });
    } catch (error) {
      console.error('Error storing transaction:', error);
      return NextResponse.json({ error: 'Failed to store transaction' }, { status: 500 });
    }
  }

  async function fetchTransactionsFromContracts(userAddress: string) {
    const startTime = Date.now();
    const MAX_EXECUTION_TIME = 30000; // 30 seconds max
    
    try {
      if (!STAKING_MANAGER_ADDRESS || !DATACOIN_ADDRESS) {
        console.log('Contract addresses not configured, skipping contract fetch');
        return;
      }

      // Check if we're taking too long
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.warn('Transaction fetch taking too long, aborting');
        return;
      }

      // Use optimized RPC provider with fallback
      let provider;
      try {
        provider = new ethers.JsonRpcProvider(MultiRPCProvider.getCurrentProvider());
        // Test the connection
        await provider.getBlockNumber();
      } catch (error) {
        console.warn('Primary RPC failed, trying fallback providers...');
        // Try fallback providers
        const fallbackProviders = [
          'https://ethereum-sepolia.publicnode.com',
          'https://sepolia.drpc.org',
          'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
        ];
        
        for (const rpcUrl of fallbackProviders) {
          try {
            provider = new ethers.JsonRpcProvider(rpcUrl);
            await provider.getBlockNumber();
            console.log(`Connected to fallback RPC: ${rpcUrl}`);
            break;
          } catch (fallbackError) {
            console.warn(`Fallback RPC failed: ${rpcUrl}`);
            continue;
          }
        }
        
        if (!provider) {
          throw new Error('All RPC providers failed');
        }
      }
      
      // Create contract instances
      const stakingContract = new ethers.Contract(STAKING_MANAGER_ADDRESS, STAKING_ABI, provider);
      const dataCoinContract = new ethers.Contract(DATACOIN_ADDRESS, DATACOIN_ABI, provider);

      // Get current block number with retry logic
      const currentBlock = await RPCOptimizer.getCachedEvents(
        `currentBlock_${userAddress}`,
        () => provider.getBlockNumber()
      );
      
      // Use much smaller block range to prevent infinite loops
      const fromBlock = Math.max(0, currentBlock - 100); // Reduced to 100 blocks only
      const blockRanges = RPCOptimizer.getOptimalBlockRange(fromBlock, currentBlock);

      console.log(`Fetching events for ${userAddress} in ${Array.isArray(blockRanges) ? blockRanges.length : 1} block range(s)`);

      // Limit the number of ranges to prevent infinite loops
      const maxRanges = 5;
      const limitedRanges = Array.isArray(blockRanges) ? blockRanges.slice(0, maxRanges) : [blockRanges];

      // Fetch events with optimized block ranges
      const eventPromises = [];
      
      // Always use limitedRanges (which is always an array)
      for (const range of limitedRanges) {
          eventPromises.push(
            RPCOptimizer.getCachedEvents(
              `staked_${userAddress}_${range.fromBlock}_${range.toBlock}`,
              () => stakingContract.queryFilter(
                stakingContract.filters.Staked(userAddress),
                range.fromBlock,
                range.toBlock
              )
            )
          );
          
          eventPromises.push(
            RPCOptimizer.getCachedEvents(
              `completed_${userAddress}_${range.fromBlock}_${range.toBlock}`,
              () => stakingContract.queryFilter(
                stakingContract.filters.CourseCompleted(userAddress),
                range.fromBlock,
                range.toBlock
              )
            )
          );
          
          eventPromises.push(
            RPCOptimizer.getCachedEvents(
              `refunded_${userAddress}_${range.fromBlock}_${range.toBlock}`,
              () => stakingContract.queryFilter(
                stakingContract.filters.StakeRefunded(userAddress),
                range.fromBlock,
                range.toBlock
              )
            )
          );
          
          eventPromises.push(
            RPCOptimizer.getCachedEvents(
              `minted_${userAddress}_${range.fromBlock}_${range.toBlock}`,
              () => dataCoinContract.queryFilter(
                dataCoinContract.filters.TokensMinted(userAddress),
                range.fromBlock,
                range.toBlock
              )
            )
          );
        }

      // Execute all queries with batching
      const results = await RPCOptimizer.batchRequests(eventPromises);
      
      // Flatten results
      const stakedEvents = results.filter((_, i) => i % 4 === 0).flat();
      const completedEvents = results.filter((_, i) => i % 4 === 1).flat();
      const refundedEvents = results.filter((_, i) => i % 4 === 2).flat();
      const mintedEvents = results.filter((_, i) => i % 4 === 3).flat();

      // Process events into transactions
      const transactions: any[] = [];

      // Process staking events
      stakedEvents.forEach(event => {
        transactions.push({
          hash: event.transactionHash,
          type: 'stake',
          amount: ethers.formatEther(event.args.amount),
          courseId: event.args.courseId.toString(),
          timestamp: Number(event.blockNumber),
          status: 'success',
          blockNumber: Number(event.blockNumber)
        });
      });

      // Process completion events
      completedEvents.forEach(event => {
        transactions.push({
          hash: event.transactionHash,
          type: 'complete',
          amount: '0',
          courseId: event.args.courseId.toString(),
          timestamp: Number(event.blockNumber),
          status: 'success',
          blockNumber: Number(event.blockNumber),
          certificateCID: event.args.certificateCID
        });
      });

      // Process refund events
      refundedEvents.forEach(event => {
        transactions.push({
          hash: event.transactionHash,
          type: 'refund',
          amount: ethers.formatEther(event.args.amount),
          courseId: event.args.courseId.toString(),
          timestamp: Number(event.blockNumber),
          status: 'success',
          blockNumber: Number(event.blockNumber)
        });
      });

      // Process DataCoin minting events
      mintedEvents.forEach(event => {
        transactions.push({
          hash: event.transactionHash,
          type: 'datacoin',
          amount: ethers.formatEther(event.args.amount),
          courseId: '0',
          timestamp: Number(event.blockNumber),
          status: 'success',
          blockNumber: Number(event.blockNumber),
          reason: event.args.reason
        });
      });

      // Sort by timestamp (newest first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);

      // Store transactions
      transactionStorage.set(userAddress, transactions);

      console.log(`Fetched ${transactions.length} transactions for ${userAddress}`);
    } catch (error) {
      console.error('Error fetching transactions from contracts:', error);
    }
  }
