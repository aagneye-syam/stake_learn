import { NextRequest, NextResponse } from 'next/server';
import { uploadEncryptedCertificate, generateCertificate } from '@/utils/lighthouse';
import { CertificateData } from '@/types/certificate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      studentAddress, 
      courseId, 
      courseName, 
      stakeAmount, 
      modules 
    } = body;

    // Validate required fields
    if (!studentAddress || !courseId || !courseName || !stakeAmount || !modules) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate certificate data
    const certificateData = generateCertificate(
      studentAddress,
      courseId,
      courseName,
      stakeAmount,
      modules
    );

    // Upload to Lighthouse with encryption
    const cid = await uploadEncryptedCertificate(certificateData, studentAddress);

    // Return success response with CID
    return NextResponse.json({
      success: true,
      cid,
      certificateData,
      lighthouseUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`
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
  const userAddress = searchParams.get('userAddress');

  if (!cid || !userAddress) {
    return NextResponse.json(
      { error: 'Missing CID or userAddress' },
      { status: 400 }
    );
  }

  try {
    const { decryptCertificate } = await import('@/utils/lighthouse');
    const certificateData = await decryptCertificate(cid, userAddress);
    
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
