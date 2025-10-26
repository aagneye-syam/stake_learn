import { NextRequest, NextResponse } from "next/server";
import { 
  submitRepository, 
  getUserRepositories, 
  getAllRepositories,
  getRepositoryStats 
} from "@/services/repository.service";
import { getUserByWallet } from "@/services/user.service";

// GET - Get repositories (user's own or all for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const adminView = searchParams.get('admin') === 'true';
    
    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }
    
    let repositories;
    if (adminView) {
      // Admin view - get all repositories
      repositories = await getAllRepositories();
    } else {
      // User view - get only their repositories
      repositories = await getUserRepositories(userAddress);
    }
    
    return NextResponse.json({ repositories });
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Submit a new repository
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userAddress, 
      repoUrl, 
      repoData 
    } = body;
    
    if (!userAddress || !repoUrl || !repoData) {
      return NextResponse.json({ 
        error: 'Missing required fields: userAddress, repoUrl, repoData' 
      }, { status: 400 });
    }
    
    // Get user details
    const user = await getUserByWallet(userAddress);
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found. Please complete onboarding first.' 
      }, { status: 404 });
    }
    
    // Submit repository
    const repoId = await submitRepository(
      userAddress,
      user.name,
      user.email,
      repoUrl,
      repoData
    );
    
    // Fetch commits from GitHub API
    try {
      const commitsResponse = await fetch(`https://api.github.com/repos/${repoData.owner}/${repoData.name}/commits?per_page=100`);
      if (commitsResponse.ok) {
        const commits = await commitsResponse.json();
        const formattedCommits = commits.map((commit: any) => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          authorEmail: commit.commit.author.email,
          date: new Date(commit.commit.author.date),
          additions: commit.stats?.additions || 0,
          deletions: commit.stats?.deletions || 0,
          filesChanged: commit.files?.map((file: any) => file.filename) || []
        }));
        
        // Add commits to repository
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/repositories/${repoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addCommits',
            commits: formattedCommits
          }),
        });
      }
    } catch (commitsError) {
      console.error('Failed to fetch commits:', commitsError);
    }
    
    // Mint DataCoins for repository submission
    try {
      const rewardResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentAddress: userAddress,
          rewardType: 'repository_submission',
          courseId: '0',
          progressPercentage: 0,
          streakDays: 0,
          milestone: 'Repository Submission',
          moduleId: '0',
          totalModules: 1
        }),
      });
      
      if (rewardResponse.ok) {
        console.log('DataCoins minted for repository submission');
      }
    } catch (rewardError) {
      console.error('Failed to mint DataCoins for repository submission:', rewardError);
    }
    
    return NextResponse.json({ 
      success: true, 
      repoId,
      message: 'Repository submitted successfully! You earned 10 DataCoins for submission.'
    });
  } catch (error: any) {
    console.error('Error submitting repository:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
