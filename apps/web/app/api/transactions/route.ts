import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

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

  if (!userAddress) {
    return NextResponse.json({ error: 'User address required' }, { status: 400 });
  }

  try {
    // Get transactions from storage
    const userTransactions = transactionStorage.get(userAddress) || [];
    
    // If no transactions in storage, try to fetch from contract events
    if (userTransactions.length === 0) {
      await fetchTransactionsFromContracts(userAddress);
      const updatedTransactions = transactionStorage.get(userAddress) || [];
      return NextResponse.json({ transactions: updatedTransactions });
    }

    return NextResponse.json({ transactions: userTransactions });
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
  try {
    if (!STAKING_MANAGER_ADDRESS || !DATACOIN_ADDRESS) {
      console.log('Contract addresses not configured, skipping contract fetch');
      return;
    }

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
    
    // Create contract instances
    const stakingContract = new ethers.Contract(STAKING_MANAGER_ADDRESS, STAKING_ABI, provider);
    const dataCoinContract = new ethers.Contract(DATACOIN_ADDRESS, DATACOIN_ABI, provider);

    // Get current block number
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks

    // Fetch StakingManager events
    const stakedEvents = await stakingContract.queryFilter(
      stakingContract.filters.Staked(userAddress),
      fromBlock,
      currentBlock
    );

    const completedEvents = await stakingContract.queryFilter(
      stakingContract.filters.CourseCompleted(userAddress),
      fromBlock,
      currentBlock
    );

    const refundedEvents = await stakingContract.queryFilter(
      stakingContract.filters.StakeRefunded(userAddress),
      fromBlock,
      currentBlock
    );

    // Fetch DataCoin events
    const mintedEvents = await dataCoinContract.queryFilter(
      dataCoinContract.filters.TokensMinted(userAddress),
      fromBlock,
      currentBlock
    );

    // Process events into transactions
    const transactions: any[] = [];

    // Process staking events
    stakedEvents.forEach(event => {
      transactions.push({
        hash: event.transactionHash,
        type: 'stake',
        amount: ethers.formatEther(event.args.amount),
        courseId: event.args.courseId.toString(),
        timestamp: event.blockNumber,
        status: 'success',
        blockNumber: event.blockNumber
      });
    });

    // Process completion events
    completedEvents.forEach(event => {
      transactions.push({
        hash: event.transactionHash,
        type: 'complete',
        amount: '0',
        courseId: event.args.courseId.toString(),
        timestamp: event.blockNumber,
        status: 'success',
        blockNumber: event.blockNumber,
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
        timestamp: event.blockNumber,
        status: 'success',
        blockNumber: event.blockNumber
      });
    });

    // Process DataCoin minting events
    mintedEvents.forEach(event => {
      transactions.push({
        hash: event.transactionHash,
        type: 'datacoin',
        amount: ethers.formatEther(event.args.amount),
        courseId: '0',
        timestamp: event.blockNumber,
        status: 'success',
        blockNumber: event.blockNumber,
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
