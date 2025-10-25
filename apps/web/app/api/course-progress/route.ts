import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for development (replace with database in production)
const progressStorage = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userAddress = searchParams.get('userAddress');
  const courseId = searchParams.get('courseId');

  if (!userAddress || !courseId) {
    return NextResponse.json(
      { error: 'Missing userAddress or courseId' },
      { status: 400 }
    );
  }

  try {
    const key = `${userAddress}-${courseId}`;
    const progress = progressStorage.get(key);

    if (!progress) {
      // Return empty progress if none exists
      return NextResponse.json({
        success: true,
        progress: {
          courseId: parseInt(courseId),
          totalModules: 0,
          completedModules: 0,
          progressPercentage: 0,
          modules: []
        }
      });
    }

    return NextResponse.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Course progress retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve course progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, courseId, progress } = body;

    if (!userAddress || !courseId || !progress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const key = `${userAddress}-${courseId}`;
    progressStorage.set(key, progress);

    return NextResponse.json({
      success: true,
      message: 'Course progress saved successfully'
    });
  } catch (error) {
    console.error('Course progress save error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save course progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
