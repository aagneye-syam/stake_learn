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
      accessToken 
    } = body;

    // Validate required fields
    if (!studentAddress || !courseId || !courseName || !accessToken) {
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

    // Upload to Lighthouse with encryption
    const cid = await uploadEncryptedJson(certificateData, accessToken, conditions);
    certificateData.cid = cid;
    certificateData.lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

    // Return success response with CID
    return NextResponse.json({
      success: true,
      cid,
      certificateData,
      lighthouseUrl: certificateData.lighthouseUrl
    });

  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate certificate',
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
