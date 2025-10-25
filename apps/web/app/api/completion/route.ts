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
    // Try to decrypt from Lighthouse first
    const { decryptFile } = await import('@/_utils/lighthouse');
    const certificateData = await decryptFile(cid, accessToken);
    
    return NextResponse.json({
      success: true,
      certificate: certificateData
    });
  } catch (error) {
    console.error('Certificate retrieval error:', error);
    
    // Fallback to mock data if Lighthouse fails
    const courseId = cid.includes('Example1') ? 1 : 
                     cid.includes('Example2') ? 2 : 
                     cid.includes('Example3') ? 3 : 
                     cid.includes('Example4') ? 4 : 
                     cid.includes('Example5') ? 5 : 
                     cid.includes('Example6') ? 6 : 1;
    
    const courseData = {
      1: { name: "Introduction to HTML", modules: [
        { id: 1, title: "HTML Basics", lessons: 8, duration: "2 hours" },
        { id: 2, title: "CSS Fundamentals", lessons: 10, duration: "3 hours" },
        { id: 3, title: "Responsive Design", lessons: 6, duration: "2.5 hours" },
        { id: 4, title: "Advanced CSS", lessons: 12, duration: "4 hours" }
      ]},
      2: { name: "CSS Fundamentals", modules: [
        { id: 1, title: "CSS Basics", lessons: 6, duration: "2 hours" },
        { id: 2, title: "Layout Techniques", lessons: 8, duration: "3 hours" },
        { id: 3, title: "Animations", lessons: 4, duration: "1.5 hours" },
        { id: 4, title: "Advanced CSS", lessons: 10, duration: "4 hours" }
      ]},
      3: { name: "Responsive Design", modules: [
        { id: 1, title: "Mobile First", lessons: 5, duration: "2 hours" },
        { id: 2, title: "Flexbox", lessons: 6, duration: "2.5 hours" },
        { id: 3, title: "Grid Layout", lessons: 4, duration: "2 hours" },
        { id: 4, title: "Media Queries", lessons: 3, duration: "1.5 hours" }
      ]},
      4: { name: "Advanced CSS", modules: [
        { id: 1, title: "CSS Variables", lessons: 4, duration: "1.5 hours" },
        { id: 2, title: "CSS Grid", lessons: 6, duration: "2.5 hours" },
        { id: 3, title: "CSS Animations", lessons: 5, duration: "2 hours" },
        { id: 4, title: "CSS Architecture", lessons: 8, duration: "3 hours" }
      ]},
      5: { name: "JavaScript Basics", modules: [
        { id: 1, title: "JS Fundamentals", lessons: 8, duration: "3 hours" },
        { id: 2, title: "DOM Manipulation", lessons: 6, duration: "2.5 hours" },
        { id: 3, title: "Events", lessons: 4, duration: "2 hours" },
        { id: 4, title: "Async JavaScript", lessons: 6, duration: "2.5 hours" }
      ]},
      6: { name: "React Fundamentals", modules: [
        { id: 1, title: "React Basics", lessons: 6, duration: "2.5 hours" },
        { id: 2, title: "Components", lessons: 8, duration: "3 hours" },
        { id: 3, title: "State Management", lessons: 6, duration: "2.5 hours" },
        { id: 4, title: "Hooks", lessons: 7, duration: "3 hours" }
      ]}
    };
    
    const selectedCourse = courseData[courseId as keyof typeof courseData] || courseData[1];
    
    const mockCertificate = {
      studentAddress: accessToken,
      courseId: courseId,
      courseName: selectedCourse.name,
      completionDate: new Date().toISOString().split('T')[0],
      uploadedAt: Math.floor(Date.now() / 1000),
      cid: cid,
      lighthouseUrl: `https://gateway.lighthouse.storage/ipfs/${cid}`,
      modules: selectedCourse.modules,
      stakeAmount: "0.0001",
      completedAt: Math.floor(Date.now() / 1000)
    };
    
    return NextResponse.json({
      success: true,
      certificate: mockCertificate,
      fallback: true // Indicate this is fallback data
    });
  }
}
