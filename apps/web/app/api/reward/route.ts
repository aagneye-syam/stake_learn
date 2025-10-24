import { NextRequest, NextResponse } from 'next/server';
import { DataCoinReward } from '@/types/certificate';
import { ethers } from 'ethers';
import { DataCoinABI } from '@/abis/DataCoinABI';

// Mock DataCoin reward amounts based on course difficulty
const REWARD_AMOUNTS = {
  'Beginner': '10', // 10 DataCoins
  'Intermediate': '25', // 25 DataCoins  
  'Advanced': '50', // 50 DataCoins
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentAddress, 
      courseId, 
      courseDifficulty,
      courseName 
    } = body;

    // Validate required fields
    if (!studentAddress || !courseId || !courseDifficulty || !courseName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate reward amount based on difficulty
    const rewardAmount = REWARD_AMOUNTS[courseDifficulty as keyof typeof REWARD_AMOUNTS] || '10';
    
    // Connect to DataCoin contract and mint tokens
    const dataCoinContractAddress = process.env.NEXT_PUBLIC_DATACOIN_ADDRESS;
    if (!dataCoinContractAddress || dataCoinContractAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'DataCoin contract address not configured' }, { status: 500 });
    }

    // Connect to the DataCoin contract
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY as string, provider);
    const dataCoinContract = new ethers.Contract(dataCoinContractAddress, DataCoinABI, wallet);

    // Mint DataCoins to the user
    const tx = await dataCoinContract.mint(studentAddress, ethers.parseUnits(rewardAmount, 18));
    await tx.wait();

    const reward: DataCoinReward = {
      amount: rewardAmount,
      tokenAddress: dataCoinContractAddress,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: tx.hash
    };

    return NextResponse.json({
      success: true,
      reward,
      message: `Awarded ${rewardAmount} DataCoins for completing ${courseName}`
    });

  } catch (error) {
    console.error('Reward distribution error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to distribute reward',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('userAddress');

  if (!userAddress) {
    return NextResponse.json(
      { error: 'Missing userAddress' },
      { status: 400 }
    );
  }

  try {
    // In a real implementation, this would fetch from a database
    // For now, return mock data
    const mockRewards: DataCoinReward[] = [
      {
        amount: '25',
        tokenAddress: process.env.NEXT_PUBLIC_DATACOIN_ADDRESS || '0x0000000000000000000000000000000000000000',
        timestamp: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      }
    ];

    const totalEarned = mockRewards.reduce((sum, reward) => sum + parseInt(reward.amount), 0);

    return NextResponse.json({
      success: true,
      rewards: mockRewards,
      totalEarned: totalEarned.toString(),
      userAddress
    });
  } catch (error) {
    console.error('Reward retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve rewards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
