import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Repository {
  id: string; // Auto-generated document ID
  userAddress: string;
  userName: string;
  userEmail: string;
  githubUsername: string;
  repoUrl: string;
  repoName: string;
  repoOwner: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  isPrivate: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string; // Admin wallet address
  dataCoinsEarned: number;
  totalCommits: number;
  verifiedCommits: number;
  commits: Commit[];
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  authorEmail: string;
  date: Timestamp;
  additions: number;
  deletions: number;
  filesChanged: string[];
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Timestamp;
  verifiedBy?: string; // Admin wallet address
  dataCoinsEarned: number;
  verificationNotes?: string;
}

/**
 * Submit a new repository for verification
 */
export async function submitRepository(
  userAddress: string,
  userName: string,
  userEmail: string,
  repoUrl: string,
  repoData: {
    name: string;
    owner: string;
    description?: string;
    language?: string;
    stars?: number;
    forks?: number;
    isPrivate: boolean;
    githubUsername?: string;
  }
): Promise<string> {
  try {
    const repoRef = doc(collection(db, 'repositories'));
    const repoId = repoRef.id;
    
    const repository: Repository = {
      id: repoId,
      userAddress: userAddress.toLowerCase(),
      userName,
      userEmail,
      githubUsername: repoData.githubUsername || repoData.owner,
      repoUrl,
      repoName: repoData.name,
      repoOwner: repoData.owner,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stars,
      forks: repoData.forks,
      isPrivate: repoData.isPrivate,
      status: 'pending',
      submittedAt: Timestamp.now(),
      dataCoinsEarned: 0,
      totalCommits: 0,
      verifiedCommits: 0,
      commits: []
    };
    
    await setDoc(repoRef, repository);
    return repoId;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit repository');
  }
}

/**
 * Get repositories submitted by a user
 */
export async function getUserRepositories(userAddress: string): Promise<Repository[]> {
  try {
    const q = query(
      collection(db, 'repositories'),
      where('userAddress', '==', userAddress.toLowerCase()),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Repository);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user repositories');
  }
}

/**
 * Get all repositories for admin review
 */
export async function getAllRepositories(): Promise<Repository[]> {
  try {
    const q = query(
      collection(db, 'repositories'),
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Repository);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get all repositories');
  }
}

/**
 * Get repository by ID
 */
export async function getRepository(repoId: string): Promise<Repository | null> {
  try {
    const repoRef = doc(db, 'repositories', repoId);
    const repoSnap = await getDoc(repoRef);
    
    if (repoSnap.exists()) {
      return repoSnap.data() as Repository;
    }
    
    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get repository');
  }
}

/**
 * Update repository status (admin action)
 */
export async function updateRepositoryStatus(
  repoId: string,
  status: 'pending' | 'approved' | 'rejected',
  reviewedBy: string,
  dataCoinsEarned: number = 0
): Promise<void> {
  try {
    const repoRef = doc(db, 'repositories', repoId);
    await updateDoc(repoRef, {
      status,
      reviewedAt: Timestamp.now(),
      reviewedBy,
      dataCoinsEarned
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update repository status');
  }
}

/**
 * Add commits to a repository
 */
export async function addCommitsToRepository(
  repoId: string,
  commits: Omit<Commit, 'status' | 'dataCoinsEarned' | 'verifiedAt' | 'verifiedBy'>[]
): Promise<void> {
  try {
    const repoRef = doc(db, 'repositories', repoId);
    const commitsWithStatus = commits.map(commit => ({
      ...commit,
      status: 'pending' as const,
      dataCoinsEarned: 0
    }));
    
    await updateDoc(repoRef, {
      commits: arrayUnion(...commitsWithStatus),
      totalCommits: commits.length
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add commits to repository');
  }
}

/**
 * Verify a commit (admin action)
 */
export async function verifyCommit(
  repoId: string,
  commitSha: string,
  status: 'verified' | 'rejected',
  verifiedBy: string,
  dataCoinsEarned: number = 0,
  verificationNotes?: string
): Promise<void> {
  try {
    const repo = await getRepository(repoId);
    if (!repo) {
      throw new Error('Repository not found');
    }
    
    const updatedCommits = repo.commits.map(commit => {
      if (commit.sha === commitSha) {
        return {
          ...commit,
          status,
          verifiedAt: Timestamp.now(),
          verifiedBy,
          dataCoinsEarned,
          verificationNotes
        };
      }
      return commit;
    });
    
    const verifiedCommits = updatedCommits.filter(c => c.status === 'verified').length;
    
    const repoRef = doc(db, 'repositories', repoId);
    await updateDoc(repoRef, {
      commits: updatedCommits,
      verifiedCommits,
      dataCoinsEarned: updatedCommits.reduce((sum, commit) => sum + commit.dataCoinsEarned, 0)
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to verify commit');
  }
}

/**
 * Get repository statistics
 */
export async function getRepositoryStats(): Promise<{
  totalRepositories: number;
  pendingRepositories: number;
  approvedRepositories: number;
  totalCommits: number;
  verifiedCommits: number;
  totalDataCoinsEarned: number;
}> {
  try {
    const repositories = await getAllRepositories();
    
    const stats = repositories.reduce((acc, repo) => {
      acc.totalRepositories++;
      if (repo.status === 'pending') acc.pendingRepositories++;
      if (repo.status === 'approved') acc.approvedRepositories++;
      acc.totalCommits += repo.totalCommits;
      acc.verifiedCommits += repo.verifiedCommits;
      acc.totalDataCoinsEarned += repo.dataCoinsEarned;
      return acc;
    }, {
      totalRepositories: 0,
      pendingRepositories: 0,
      approvedRepositories: 0,
      totalCommits: 0,
      verifiedCommits: 0,
      totalDataCoinsEarned: 0
    });
    
    return stats;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get repository statistics');
  }
}
