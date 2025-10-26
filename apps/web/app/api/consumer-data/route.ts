import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { DataCoinABI } from '@/abis/DataCoinABI';
import { getReclaimService } from '@/utils/reclaim';

// In-memory storage for consumer data contributions
declare global {
  var consumerDataStorage: Map<string, any[]> | undefined;
}

if (!global.consumerDataStorage) {
  global.consumerDataStorage = new Map<string, any[]>();
}

const consumerDataStorage = global.consumerDataStorage;

// Consumer data reward amounts
const CONSUMER_DATA_REWARDS = {
  'github_contribution': 10,  // Per verified contribution batch
  'uber_ride_data': 5,        // Per month of ride data
  'amazon_purchase_data': 5,  // Per month of purchase data
  'consumer_data_verified': 20 // Bonus for first verification
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userAddress, 
      dataSource, 
      proofData, 
      zkProof 
    } = body;

    // Validate required fields
    if (!userAddress || !dataSource || !proofData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate data source
    const validSources = ['github', 'uber', 'amazon'];
    if (!validSources.includes(dataSource)) {
      return NextResponse.json(
        { error: 'Invalid data source' },
        { status: 400 }
      );
    }

    // Get Reclaim service
    const reclaimService = getReclaimService();
    
    // Verify the proof using Reclaim SDK
    const verification = await reclaimService.verifyProof(proofData, dataSource);
    
    if (!verification.success) {
      return NextResponse.json(
        { error: 'Proof verification failed', details: verification.error },
        { status: 400 }
      );
    }

    // Calculate DataCoins based on verified data
    const dataCoinsEarned = reclaimService.calculateDataCoins(verification.data, dataSource);
    
    // Check if this is user's first consumer data verification
    const userContributions = consumerDataStorage.get(userAddress) || [];
    const isFirstVerification = userContributions.length === 0;
    
    // Add bonus for first verification
    const totalDataCoins = dataCoinsEarned + (isFirstVerification ? CONSUMER_DATA_REWARDS.consumer_data_verified : 0);

    // Create contribution record
    const contribution = {
      userAddress,
      dataSource,
      proofCid: verification.proofHash,
      zkProof,
      dataHash: verification.dataHash || '',
      timestamp: Math.floor(Date.now() / 1000),
      dataCoinsEarned: totalDataCoins,
      verified: true,
      data: verification.data,
      isFirstVerification
    };

    // Store contribution
    userContributions.push(contribution);
    consumerDataStorage.set(userAddress, userContributions);

    // Mint DataCoins using existing contract logic
    let txHash = `mock-consumer-data-${Date.now()}`;
    
    try {
      // Check if we have contract configuration
      const dataCoinContractAddress = process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA;
      
      if (dataCoinContractAddress && process.env.DEPLOYER_PRIVATE_KEY && process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL) {
        // Connect to the DataCoin contract
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY as string, provider);
        const dataCoinContract = new ethers.Contract(dataCoinContractAddress, DataCoinABI, wallet);

        // Get current gas price and add buffer
        const gasPrice = await provider.getFeeData();
        const gasPriceWithBuffer = gasPrice.gasPrice ? gasPrice.gasPrice * BigInt(120) / BigInt(100) : undefined;

        // Mint DataCoins for consumer data
        const tx = await dataCoinContract.mint(
          userAddress, 
          ethers.parseUnits(totalDataCoins.toString(), 18), 
          `Consumer data verification: ${dataSource}`,
          {
            gasPrice: gasPriceWithBuffer,
            gasLimit: 200000
          }
        );
        
        await tx.wait();
        txHash = tx.hash;
        console.log(`Consumer data DataCoins minted: ${txHash}`);
      } else {
        console.log('Contract not configured, using mock transaction for consumer data');
      }
    } catch (contractError) {
      console.error('Contract interaction failed for consumer data:', contractError);
      // Continue with mock transaction
    }

    // Track transaction
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          type: 'consumer_data',
          amount: totalDataCoins.toString(),
          courseId: '0',
          hash: txHash,
          timestamp: Math.floor(Date.now() / 1000),
          status: 'success',
          reason: `Verified ${dataSource} data`,
          dataSource
        }),
      });
    } catch (error) {
      console.error('Failed to track consumer data transaction:', error);
    }

    return NextResponse.json({
      success: true,
      contribution,
      dataCoinsEarned: totalDataCoins,
      transactionHash: txHash,
      message: `Successfully verified ${dataSource} data and earned ${totalDataCoins} DataCoins`
    });

  } catch (error) {
    console.error('Error processing consumer data:', error);
    return NextResponse.json(
      { error: 'Failed to process consumer data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }

    const contributions = consumerDataStorage.get(userAddress) || [];
    
    // Calculate total stats
    const stats = {
      totalContributions: contributions.length,
      totalDataCoins: contributions.reduce((sum, c) => sum + c.dataCoinsEarned, 0),
      bySource: {
        github: contributions.filter(c => c.dataSource === 'github').length,
        uber: contributions.filter(c => c.dataSource === 'uber').length,
        amazon: contributions.filter(c => c.dataSource === 'amazon').length,
      },
      lastContribution: contributions.length > 0 ? contributions[contributions.length - 1].timestamp : null
    };

    return NextResponse.json({
      contributions,
      stats
    });

  } catch (error) {
    console.error('Error fetching consumer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consumer data' },
      { status: 500 }
    );
  }
}