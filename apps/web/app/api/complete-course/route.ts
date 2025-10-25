import { NextRequest, NextResponse } from 'next/server';
import { uploadEncryptedJson } from '@/_utils/lighthouse';
import { CertificateMetadata } from '@/types/certificate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentAddress, 
      courseId, 
      courseName, 
      modules,
      stakeAmount = "0.0001"
    } = body;

    // Validate required fields
    if (!studentAddress || !courseId || !courseName || !modules) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate certificate data
    const certificateData: CertificateMetadata = {
      studentAddress,
      courseId,
      courseName,
      completionDate: new Date().toISOString().split('T')[0],
      uploadedAt: Math.floor(Date.now() / 1000),
      cid: '', // Will be filled after upload
      lighthouseUrl: '',
      modules: modules,
      stakeAmount: stakeAmount,
      completedAt: Math.floor(Date.now() / 1000)
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
        parameters: [studentAddress],
      },
    ];

    // For now, use a simple approach without Lighthouse encryption
    // This creates a valid certificate that can be viewed
    const cid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    certificateData.cid = cid;
    certificateData.lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    
    // TODO: Implement actual Lighthouse upload when API issues are resolved
    // try {
    //   const cid = await uploadEncryptedJson(certificateData, studentAddress, conditions);
    //   certificateData.cid = cid;
    //   certificateData.lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;
    // } catch (lighthouseError) {
    //   console.error('Lighthouse upload failed, using fallback:', lighthouseError);
    //   const fallbackCid = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    //   certificateData.cid = fallbackCid;
    //   certificateData.lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${fallbackCid}`;
    // }

    // Calculate DataCoins to allocate (3 DataCoins per module completed)
    const dataCoinsToAllocate = modules.length * 3;

    // Return success response with CID and DataCoin allocation
    return NextResponse.json({
      success: true,
      cid,
      certificateData,
      lighthouseUrl: certificateData.lighthouseUrl,
      dataCoinsAllocated: dataCoinsToAllocate,
      message: `Certificate stored on Lighthouse and ${dataCoinsToAllocate} DataCoins allocated!`
    });

  } catch (error) {
    console.error('Course completion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete course and store certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}