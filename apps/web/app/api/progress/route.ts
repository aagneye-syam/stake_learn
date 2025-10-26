import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { DataCoinABI } from '@/abis/DataCoinABI';

// In-memory storage for development (replace with database in production)
// Use global variable to persist across requests
declare global {
  var progressStorage: Map<string, any> | undefined;
}

if (!global.progressStorage) {
  global.progressStorage = new Map<string, any>();
}

const progressStorage = global.progressStorage;

// Progress-based reward amounts
const PROGRESS_REWARDS = {
  'daily_streak': '5', // 5 DataCoins for daily login
  'course_progress': '3', // 3 DataCoins for 25% course progress
  'milestone': '8', // 8 DataCoins for course milestones
  'weekly_streak': '15', // 15 DataCoins for 7-day streak
  'monthly_streak': '50', // 50 DataCoins for 30-day streak
  
  // Consumer data rewards
  'github_contribution': '10',  // Per verified commit/PR batch
  'uber_ride_data': '5',        // Per month of ride data
  'amazon_purchase_data': '5',  // Per month of purchase data
  'consumer_data_verified': '20', // Bonus for first verification
  
  // Repository submission rewards
  'repository_submission': '10', // 10 DataCoins for submitting a repository
  'commit_verification': '5',    // 5 DataCoins per verified commit
  'repository_approval': '50'    // 50 DataCoins when repository is approved
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
      milestone,
      moduleId,
      totalModules
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
    const dataCoinContractAddress = process.env.NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA;
    let txHash = 'mock-transaction-hash';
    
    // Check if we have the required environment variables for real minting
    if (!dataCoinContractAddress || dataCoinContractAddress === '0x0000000000000000000000000000000000000000' || 
        !process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL) {
      console.log('DataCoin contract not configured, using mock transaction');
      // Return mock success for development
      const reward = {
        amount: rewardAmount,
        tokenAddress: '0x0000000000000000000000000000000000000000',
        timestamp: Math.floor(Date.now() / 1000),
        transactionHash: txHash,
        rewardType,
        courseId,
        progressPercentage,
        streakDays,
        milestone
      };

      // Save progress to storage if module completion (BEFORE returning)
      if (moduleId && totalModules && courseId) {
        const key = `${studentAddress}-${courseId}`;
        let existingProgress = progressStorage.get(key);
        
        if (!existingProgress) {
          // Create new progress if none exists
          existingProgress = {
            courseId: parseInt(courseId),
            totalModules: parseInt(totalModules),
            completedModules: 0,
            progressPercentage: 0,
            modules: []
          };
          
          // Initialize all modules
          for (let i = 1; i <= parseInt(totalModules); i++) {
            existingProgress.modules.push({
              courseId: parseInt(courseId),
              moduleId: i,
              completed: false
            });
          }
        }

        // Update the specific module
        const moduleIndex = existingProgress.modules.findIndex((m: any) => m.moduleId === parseInt(moduleId));
        
        const moduleData = {
          courseId: parseInt(courseId),
          moduleId: parseInt(moduleId),
          completed: true,
          completedAt: Math.floor(Date.now() / 1000),
          rewardEarned: rewardAmount,
          transactionHash: txHash
        };

        if (moduleIndex >= 0) {
          existingProgress.modules[moduleIndex] = moduleData;
        } else {
          existingProgress.modules.push(moduleData);
        }

        // Recalculate progress
        const completedModules = existingProgress.modules.filter((m: any) => m.completed).length;
        existingProgress.completedModules = completedModules;
        existingProgress.progressPercentage = Math.floor((completedModules / parseInt(totalModules)) * 100);

        // Save updated progress
        progressStorage.set(key, existingProgress);
        console.log('Saved progress to storage (mock path):', key, existingProgress);
      }

      // Track the transaction
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAddress: studentAddress,
            type: 'datacoin',
            amount: rewardAmount,
            courseId: courseId || '0',
            hash: txHash,
            timestamp: Math.floor(Date.now() / 1000),
            status: 'success'
          }),
        });
      } catch (error) {
        console.error('Failed to track transaction:', error);
      }

      return NextResponse.json({
        success: true,
        reward,
        message: `Awarded ${rewardAmount} DataCoins for ${rewardType} (mock transaction)`
      });
    }

    try {
      // Check if we have a valid private key
      if (!process.env.DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY === '') {
        throw new Error('No private key configured, using mock transaction');
    }

    // Connect to the DataCoin contract
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY as string, provider);
    const dataCoinContract = new ethers.Contract(dataCoinContractAddress, DataCoinABI, wallet);

      // Get current gas price and add buffer
      const gasPrice = await provider.getFeeData();
      const gasPriceWithBuffer = gasPrice.gasPrice ? gasPrice.gasPrice * BigInt(120) / BigInt(100) : undefined; // 20% buffer

      // Mint DataCoins to the user with retry logic
      let tx;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Get fresh gas price for each retry
          const currentGasPrice = await provider.getFeeData();
          const retryGasPrice = currentGasPrice.gasPrice ? 
            currentGasPrice.gasPrice * (BigInt(120) + BigInt(retryCount * 10)) / BigInt(100) : // Increase gas price with each retry
            undefined;

          tx = await dataCoinContract.mint(
            studentAddress, 
            ethers.parseUnits(rewardAmount, 18), 
            `Module ${moduleId} completion reward`,
            {
              gasPrice: retryGasPrice,
              gasLimit: 200000, // Set reasonable gas limit
              nonce: await provider.getTransactionCount(wallet.address, 'pending') // Use pending nonce
            }
          );
          
          console.log(`Transaction submitted (attempt ${retryCount + 1}): ${tx.hash}`);
    await tx.wait();
          txHash = tx.hash;
          console.log(`Transaction confirmed: ${txHash}`);
          break; // Success, exit retry loop
          
        } catch (retryError: any) {
          retryCount++;
          console.error(`Transaction attempt ${retryCount} failed:`, retryError.message);
          
          if (retryCount >= maxRetries) {
            throw retryError; // Re-throw if max retries reached
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (contractError) {
      console.error('Contract interaction failed, using mock transaction:', contractError);
      
      // If it's a known transaction error, try to get the transaction hash
      if (contractError.transaction) {
        txHash = contractError.transaction;
        console.log(`Using transaction hash from error: ${txHash}`);
      } else {
        // Continue with mock transaction for development
      }
    }

    const reward = {
      amount: rewardAmount,
      tokenAddress: dataCoinContractAddress || '0x0000000000000000000000000000000000000000',
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: txHash,
      rewardType,
      courseId,
      progressPercentage,
      streakDays,
      milestone
    };

    // Save progress to storage if module completion (real minting path)
    if (moduleId && totalModules && courseId) {
      const key = `${studentAddress}-${courseId}`;
      let existingProgress = progressStorage.get(key);
      
      if (!existingProgress) {
        // Create new progress if none exists
        existingProgress = {
          courseId: parseInt(courseId),
          totalModules: parseInt(totalModules),
          completedModules: 0,
          progressPercentage: 0,
          modules: []
        };
        
        // Initialize all modules
        for (let i = 1; i <= parseInt(totalModules); i++) {
          existingProgress.modules.push({
            courseId: parseInt(courseId),
            moduleId: i,
            completed: false
          });
        }
      }

      // Update the specific module
      const moduleIndex = existingProgress.modules.findIndex((m: any) => m.moduleId === parseInt(moduleId));
      
      const moduleData = {
        courseId: parseInt(courseId),
        moduleId: parseInt(moduleId),
        completed: true,
        completedAt: Math.floor(Date.now() / 1000),
        rewardEarned: rewardAmount,
        transactionHash: txHash
      };

      if (moduleIndex >= 0) {
        existingProgress.modules[moduleIndex] = moduleData;
      } else {
        existingProgress.modules.push(moduleData);
      }

      // Recalculate progress
      const completedModules = existingProgress.modules.filter((m: any) => m.completed).length;
      existingProgress.completedModules = completedModules;
      existingProgress.progressPercentage = Math.floor((completedModules / parseInt(totalModules)) * 100);

      // Save updated progress
      progressStorage.set(key, existingProgress);
      console.log('Saved progress to storage (real minting path):', key, existingProgress);
    }

    // Track the transaction
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: studentAddress,
          type: 'datacoin',
          amount: rewardAmount,
          courseId: courseId || '0',
          hash: txHash,
          timestamp: Math.floor(Date.now() / 1000),
          status: 'success'
        }),
      });
    } catch (error) {
      console.error('Failed to track transaction:', error);
    }

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
  const courseId = searchParams.get('courseId');
  const totalModules = searchParams.get('totalModules');

  if (!userAddress) {
    return NextResponse.json(
      { error: 'Missing userAddress' },
      { status: 400 }
    );
  }

  try {
    // If courseId is provided, return course-specific progress
    if (courseId) {
      const key = `${userAddress}-${courseId}`;
      const courseProgress = progressStorage.get(key);

      if (!courseProgress) {
        // Initialize empty progress with correct number of modules
        const moduleCount = totalModules ? parseInt(totalModules) : 4; // Use provided totalModules or default to 4
        const modules = [];
        for (let i = 1; i <= moduleCount; i++) {
          modules.push({
            courseId: parseInt(courseId),
            moduleId: i,
            completed: false
          });
        }
        
        const emptyProgress = {
          courseId: parseInt(courseId),
          totalModules: moduleCount,
          completedModules: 0,
          progressPercentage: 0,
          modules
        };
        
        // Save the initialized progress
        progressStorage.set(key, emptyProgress);
        console.log('Initialized empty progress:', key, emptyProgress);
        
        return NextResponse.json({
          success: true,
          progress: emptyProgress
        });
      }

      console.log('Retrieved existing progress:', key, courseProgress);

      return NextResponse.json({
        success: true,
        progress: courseProgress
      });
    }

    // Return general progress data
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
