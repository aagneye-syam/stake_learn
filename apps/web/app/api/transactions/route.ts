  import { NextRequest, NextResponse } from 'next/server';
  import { ethers } from 'ethers';
  import { RPCOptimizer } from '@/lib/rpcOptimizer';
  import { MultiRPCProvider } from '@/lib/multiRPC';
  import { LocalBlockchain } from '@/lib/localBlockchain';
  import { db } from '@/lib/firebase';
  import { collection, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, where } from 'firebase/firestore';

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

  // Firestore helpers
  async function getLastProcessedBlock(userAddress: string): Promise<number> {
    try {
      const ref = doc(db, 'transactionState', userAddress.toLowerCase());
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data().lastProcessedBlock as number) : 0;
    } catch {
      return 0;
    }
  }

  async function setLastProcessedBlock(userAddress: string, blockNumber: number): Promise<void> {
    const ref = doc(db, 'transactionState', userAddress.toLowerCase());
    await setDoc(ref, { lastProcessedBlock: blockNumber, updatedAt: Timestamp.now() }, { merge: true });
  }

  async function saveTransactionsToFirestore(userAddress: string, txs: any[]): Promise<void> {
    const col = collection(db, 'userTransactions');
    const lower = userAddress.toLowerCase();
    for (const tx of txs) {
      const id = (tx.hash || `${lower}_${tx.type}_${tx.blockNumber}_${tx.courseId || '0'}`).toLowerCase();
      const ref = doc(col, id);
      await setDoc(ref, {
        userAddress: lower,
        hash: tx.hash,
        type: tx.type,
        amount: tx.amount,
        courseId: tx.courseId,
        timestamp: tx.timestamp,
        status: tx.status,
        blockNumber: tx.blockNumber,
        reason: tx.reason,
        createdAt: Timestamp.now()
      }, { merge: true });
    }
  }

  async function getTransactionsFromFirestore(userAddress: string): Promise<any[]> {
    const lower = userAddress.toLowerCase();
    const col = collection(db, 'userTransactions');
    const q = query(col, where('userAddress', '==', lower), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    const out: any[] = [];
    snap.forEach(d => out.push(d.data()));
    return out;
  }

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

      // Rolling fetch using lastProcessedBlock
      const lower = userAddress.toLowerCase();
      const lastProcessed = await getLastProcessedBlock(lower);

      // Use optimized RPC provider with fallback
      let provider;
      try {
        provider = new ethers.JsonRpcProvider(MultiRPCProvider.getCurrentProvider());
        await provider.getBlockNumber();
      } catch (error) {
        const fallbackProviders = [
          'https://ethereum-sepolia.publicnode.com',
          'https://sepolia.drpc.org',
          'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
        ];
        for (const rpcUrl of fallbackProviders) {
          try {
            provider = new ethers.JsonRpcProvider(rpcUrl);
            await provider.getBlockNumber();
            break;
          } catch {
            continue;
          }
        }
        if (!provider) {
          throw new Error('All RPC providers failed');
        }
      }

      const currentBlock = await RPCOptimizer.getCachedEvents(
        `currentBlock_${lower}`,
        () => provider.getBlockNumber()
      );

      const defaultLookback = 50000; // initial bootstrap window
      const fromBlock = Math.max(0, lastProcessed > 0 ? lastProcessed + 1 : currentBlock - defaultLookback);
      const toBlock = currentBlock;

      if (fromBlock <= toBlock) {
        await fetchTransactionsFromContracts(lower, provider, fromBlock, toBlock).then(async (txs) => {
          if (txs.length > 0) {
            await saveTransactionsToFirestore(lower, txs);
          }
          await setLastProcessedBlock(lower, toBlock);
        });
      }

      const persisted = await getTransactionsFromFirestore(lower);
      return NextResponse.json({ 
        transactions: persisted,
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

      // Store transaction in Firestore
      await saveTransactionsToFirestore(userAddress, [transaction]);

      return NextResponse.json({ success: true, transaction });
    } catch (error) {
      console.error('Error storing transaction:', error);
      return NextResponse.json({ error: 'Failed to store transaction' }, { status: 500 });
    }
  }

  async function fetchTransactionsFromContracts(userAddress: string, providerParam?: any, fromBlockParam?: number, toBlockParam?: number): Promise<any[]> {
    const startTime = Date.now();
    const MAX_EXECUTION_TIME = 30000; // 30 seconds max
    
    try {
      if (!STAKING_MANAGER_ADDRESS || !DATACOIN_ADDRESS) {
        console.log('Contract addresses not configured, skipping contract fetch');
        return [];
      }

      // Check if we're taking too long
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        console.warn('Transaction fetch taking too long, aborting');
        return [];
      }

      const provider = providerParam || new ethers.JsonRpcProvider(MultiRPCProvider.getCurrentProvider());
      
      // Create contract instances
      const stakingContract = new ethers.Contract(STAKING_MANAGER_ADDRESS, STAKING_ABI, provider);
      const dataCoinContract = new ethers.Contract(DATACOIN_ADDRESS, DATACOIN_ABI, provider);

      // Determine block window
      const currentBlock = toBlockParam ?? await provider.getBlockNumber();
      const fromBlock = fromBlockParam ?? Math.max(0, currentBlock - 100);
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

      console.log(`Fetched ${transactions.length} transactions for ${userAddress} from blocks ${fromBlock}-${currentBlock}`);
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions from contracts:', error);
      return [];
    }
  }
