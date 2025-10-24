import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { DataCoinABI } from '@/abis/DataCoinABI';

// Progress-based reward amounts
const PROGRESS_REWARDS = {
  'daily_streak': '5', // 5 DataCoins for daily login
  'course_progress': '3', // 3 DataCoins for 25% course progress
  'milestone': '8', // 8 DataCoins for course milestones
  'weekly_streak': '15', // 15 DataCoins for 7-day streak
  'monthly_streak': '50', // 50 DataCoins for 30-day streak
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentAddress, 
      rewardType,
      courseId,
      progressPercentage,
      streakDays,
      milestone
    } = body;

    // Validate required fields
    if (!studentAddress || !rewardType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get reward amount based on type
    const rewardAmount = PROGRESS_REWARDS[rewardType as keyof typeof PROGRESS_REWARDS] || '1';
    
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

    const reward = {
      amount: rewardAmount,
      tokenAddress: dataCoinContractAddress,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: tx.hash,
      rewardType,
      courseId,
      progressPercentage,
      streakDays,
      milestone
    };

    return NextResponse.json({
      success: true,
      reward,
      message: `Awarded ${rewardAmount} DataCoins for ${rewardType}`
    });

  } catch (error) {
    console.error('Progress reward error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to distribute progress reward',
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
    // For now, return mock progress data
    const mockProgress = {
      dailyStreak: 5,
      weeklyStreak: 2,
      monthlyStreak: 0,
      totalProgressRewards: 45,
      lastActivity: new Date().toISOString(),
      milestones: [
        { type: 'daily_streak', count: 5, lastReward: new Date().toISOString() },
        { type: 'course_progress', count: 3, lastReward: new Date().toISOString() },
        { type: 'milestone', count: 1, lastReward: new Date().toISOString() }
      ]
    };

    return NextResponse.json({
      success: true,
      progress: mockProgress,
      userAddress
    });
  } catch (error) {
    console.error('Progress retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
