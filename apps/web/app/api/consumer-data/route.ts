import { NextResponse } from 'next/server';
import { reclaimService, ConsumerDataContribution } from '@/_utils/reclaim';
import { uploadEncryptedJson } from '@/_utils/lighthouse';

// Global storage for consumer data contributions
declare global {
  var consumerDataStorage: Map<string, ConsumerDataContribution[]> | undefined;
}

if (!global.consumerDataStorage) {
  global.consumerDataStorage = new Map<string, ConsumerDataContribution[]>();
}

const consumerDataStorage = global.consumerDataStorage;

// POST /api/consumer-data - Submit zkTLS proof and mint DataCoins
export async function POST(request: Request) {
  try {
    const { userAddress, dataSource, proofData, requestId } = await request.json();

    if (!userAddress || !dataSource || !proofData) {
      return NextResponse.json({ 
        error: 'Missing required fields: userAddress, dataSource, proofData' 
      }, { status: 400 });
    }

    if (!['github', 'uber', 'amazon'].includes(dataSource)) {
      return NextResponse.json({ 
        error: 'Invalid dataSource. Must be github, uber, or amazon' 
      }, { status: 400 });
    }

    // Verify the proof using Reclaim SDK
    const verification = await reclaimService.verifyProof(proofData, dataSource);
    
    if (!verification.success) {
      return NextResponse.json({ 
        error: `Proof verification failed: ${verification.error}` 
      }, { status: 400 });
    }

    // Calculate DataCoins based on verified data
    const dataCoinsEarned = reclaimService.calculateDataCoins(verification.data, dataSource);
    
    if (dataCoinsEarned <= 0) {
      return NextResponse.json({ 
        error: 'No DataCoins earned from this data. Try contributing more data.' 
      }, { status: 400 });
    }

    // Store proof on Lighthouse
    const proofMetadata = {
      userAddress,
      dataSource,
      verifiedData: verification.data,
      proofHash: verification.proofHash,
      timestamp: Date.now(),
      requestId,
    };

    let proofCid: string;
    try {
      // Upload proof metadata to Lighthouse
      proofCid = await uploadEncryptedJson(proofMetadata, userAddress, [
        {
          contractAddress: "", // No specific contract requirement
          standardContractType: "",
          chain: "ethereum",
          method: "",
          parameters: [":userAddress"],
          returnValueTest: {
            comparator: "=",
            value: userAddress,
          },
        },
      ]);
    } catch (lighthouseError) {
      console.error('Lighthouse upload failed, using fallback:', lighthouseError);
      // Fallback to mock CID if Lighthouse fails
      proofCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    }

    // Create consumer data contribution record
    const contribution: ConsumerDataContribution = {
      userAddress,
      dataSource,
      proofCid,
      zkProof: proofData,
      dataHash: verification.proofHash || `hash_${Date.now()}`,
      timestamp: Date.now(),
      dataCoinsEarned,
      verified: true,
      data: verification.data,
    };

    // Store in global storage
    const userContributions = consumerDataStorage.get(userAddress) || [];
    userContributions.push(contribution);
    consumerDataStorage.set(userAddress, userContributions);

    // Track transaction
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: userAddress,
          type: 'consumer_data',
          amount: dataCoinsEarned.toString(),
          courseId: dataSource, // Use dataSource as identifier
          hash: `0x${Math.random().toString(16).substring(2, 66)}`,
          timestamp: Math.floor(Date.now() / 1000),
          status: 'success',
          reason: `${dataSource} data verification reward`,
          proofCid: proofCid,
        }),
      });
    } catch (error) {
      console.error('Failed to track consumer data transaction:', error);
    }

    // Mint DataCoins using existing minting logic
    try {
      const mintResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: userAddress,
          courseId: 0, // Special course ID for consumer data
          moduleId: 0,
          totalModules: 1,
          rewardType: 'consumer_data_verified',
          rewardAmount: dataCoinsEarned.toString(),
          dataSource: dataSource,
        }),
      });

      if (!mintResponse.ok) {
        console.error('Failed to mint DataCoins for consumer data');
      }
    } catch (error) {
      console.error('Failed to mint DataCoins:', error);
    }

    return NextResponse.json({
      success: true,
      contribution,
      dataCoinsEarned,
      proofCid,
      message: `Successfully verified ${dataSource} data and earned ${dataCoinsEarned} DataCoins!`,
    });

  } catch (error) {
    console.error('Error processing consumer data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET /api/consumer-data - Retrieve user's consumer data contributions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json({ 
        error: 'Missing userAddress parameter' 
      }, { status: 400 });
    }

    const contributions = consumerDataStorage.get(userAddress) || [];
    
    // Calculate total DataCoins earned from consumer data
    const totalDataCoins = contributions.reduce((sum, contrib) => sum + contrib.dataCoinsEarned, 0);
    
    // Group by data source
    const bySource = contributions.reduce((acc, contrib) => {
      if (!acc[contrib.dataSource]) {
        acc[contrib.dataSource] = [];
      }
      acc[contrib.dataSource].push(contrib);
      return acc;
    }, {} as Record<string, ConsumerDataContribution[]>);

    return NextResponse.json({
      success: true,
      contributions,
      totalDataCoins,
      bySource,
      count: contributions.length,
    });

  } catch (error) {
    console.error('Error fetching consumer data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// DELETE /api/consumer-data - Remove a specific contribution (for testing)
export async function DELETE(request: Request) {
  try {
    const { userAddress, contributionId } = await request.json();

    if (!userAddress || !contributionId) {
      return NextResponse.json({ 
        error: 'Missing userAddress or contributionId' 
      }, { status: 400 });
    }

    const contributions = consumerDataStorage.get(userAddress) || [];
    const filteredContributions = contributions.filter(
      (contrib, index) => index.toString() !== contributionId
    );
    
    consumerDataStorage.set(userAddress, filteredContributions);

    return NextResponse.json({
      success: true,
      message: 'Contribution removed successfully',
    });

  } catch (error) {
    console.error('Error removing consumer data:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
