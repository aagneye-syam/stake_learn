import { NextRequest, NextResponse } from "next/server";
import { 
  getRepository, 
  updateRepositoryStatus, 
  addCommitsToRepository,
  verifyCommit 
} from "@/services/repository.service";

// GET - Get specific repository
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repoId = params.id;
    const repository = await getRepository(repoId);
    
    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }
    
    return NextResponse.json({ repository });
  } catch (error: any) {
    console.error('Error fetching repository:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update repository (admin actions)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const repoId = params.id;
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'updateStatus':
        const { status, reviewedBy, dataCoinsEarned } = data;
        await updateRepositoryStatus(repoId, status, reviewedBy, dataCoinsEarned);
        
        // Mint DataCoins for repository approval
        if (status === 'approved') {
          try {
            const rewardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/progress`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentAddress: reviewedBy, // Admin gets the reward
                rewardType: 'repository_approval',
                courseId: '0',
                progressPercentage: 0,
                streakDays: 0,
                milestone: 'Repository Approval',
                moduleId: '0',
                totalModules: 1
              }),
            });
            
            if (rewardResponse.ok) {
              console.log('DataCoins minted for repository approval');
            }
          } catch (rewardError) {
            console.error('Failed to mint DataCoins for repository approval:', rewardError);
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Repository ${status} successfully` 
        });
        
      case 'addCommits':
        const { commits } = data;
        await addCommitsToRepository(repoId, commits);
        return NextResponse.json({ 
          success: true, 
          message: 'Commits added successfully' 
        });
        
      case 'verifyCommit':
        const { 
          commitSha, 
          status: commitStatus, 
          verifiedBy, 
          dataCoinsEarned: commitDataCoins,
          verificationNotes 
        } = data;
        await verifyCommit(
          repoId, 
          commitSha, 
          commitStatus, 
          verifiedBy, 
          commitDataCoins,
          verificationNotes
        );
        
        // Mint DataCoins for commit verification
        if (commitStatus === 'verified') {
          try {
            const rewardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/progress`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentAddress: verifiedBy, // Admin gets the reward
                rewardType: 'commit_verification',
                courseId: '0',
                progressPercentage: 0,
                streakDays: 0,
                milestone: 'Commit Verification',
                moduleId: '0',
                totalModules: 1
              }),
            });
            
            if (rewardResponse.ok) {
              console.log('DataCoins minted for commit verification');
            }
          } catch (rewardError) {
            console.error('Failed to mint DataCoins for commit verification:', rewardError);
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          message: `Commit ${commitStatus} successfully` 
        });
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error updating repository:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
