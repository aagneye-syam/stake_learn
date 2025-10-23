import { NextRequest, NextResponse } from 'next/server';
import { uploadEncryptedJson } from '@/_utils/lighthouse';
import { CertificateMetadata } from '@/types/certificate';
import { ethers } from 'ethers';
import { DataCoinABI } from '@/abis/DataCoinABI';

// Course difficulty to DataCoin reward mapping
const COURSE_REWARDS = {
  'Beginner': '10',
  'Intermediate': '25', 
  'Advanced': '50',
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentAddress, 
      courseId, 
      courseName,
      courseDifficulty,
      accessToken 
    } = body;

    // Validate required fields
    if (!studentAddress || !courseId || !courseName || !courseDifficulty || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Generate and upload certificate to Lighthouse
    const certificateData: CertificateMetadata = {
      studentAddress,
      courseId,
      courseName,
      completionDate: new Date().toISOString().split('T')[0],
      uploadedAt: Math.floor(Date.now() / 1000),
      cid: '', // Will be filled after upload
      lighthouseUrl: '',
    };

    // Define access control conditions (only the student can decrypt)
    const conditions = [
      {
        id: 1,
        chain: "sepolia",
        method: "eth_getBalance",
        standardContractType: "ERC721",
        contractAddress: "",
        returnValueTest: {
          comparator: ">=",
          value: "0",
        },
        parameters: [":userAddress"],
      },
    ];

    // Upload certificate to Lighthouse
    const cid = await uploadEncryptedJson(certificateData, accessToken, conditions);
    certificateData.cid = cid;
    certificateData.lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    // Step 2: Award DataCoin rewards
    const rewardAmount = COURSE_REWARDS[courseDifficulty as keyof typeof COURSE_REWARDS] || '10';
    
    const dataCoinContractAddress = process.env.NEXT_PUBLIC_DATACOIN_ADDRESS;
    if (!dataCoinContractAddress || dataCoinContractAddress === '0x0000000000000000000000000000000000000000') {
      return NextResponse.json({ error: 'DataCoin contract address not configured' }, { status: 500 });
    }

    // Connect to the DataCoin contract and mint tokens
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY as string, provider);
    const dataCoinContract = new ethers.Contract(dataCoinContractAddress, DataCoinABI, wallet);

    // Mint DataCoins to the user
    const tx = await dataCoinContract.mint(studentAddress, ethers.parseUnits(rewardAmount, 18));
    await tx.wait();

    // Step 3: Return success response with both certificate and reward info
    return NextResponse.json({
      success: true,
      certificate: {
        cid,
        lighthouseUrl: certificateData.lighthouseUrl,
        studentAddress,
        courseId,
        courseName,
        completionDate: certificateData.completionDate
      },
      reward: {
        amount: rewardAmount,
        tokenAddress: dataCoinContractAddress,
        transactionHash: tx.hash,
        timestamp: Math.floor(Date.now() / 1000)
      },
      message: `Course completed! Certificate stored on Lighthouse and ${rewardAmount} DataCoins awarded.`
    });

  } catch (error) {
    console.error('Course completion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete course',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cid = searchParams.get('cid');
  const accessToken = searchParams.get('accessToken');

  if (!cid || !accessToken) {
    return NextResponse.json(
      { error: 'Missing CID or accessToken' },
      { status: 400 }
    );
  }

  try {
    const { decryptFile } = await import('@/_utils/lighthouse');
    const certificateData = await decryptFile(cid, accessToken);
    
    return NextResponse.json({
      success: true,
      certificate: certificateData
    });
  } catch (error) {
    console.error('Certificate retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
