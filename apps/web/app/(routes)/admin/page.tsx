"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRepositories } from "@/hooks/useRepositories";
import type { Repository, Commit } from "@/services/repository.service";
import { useWalletAuth } from "@/_context/WalletAuthContext";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  GitCommit, 
  Star, 
  GitFork,
  User,
  Calendar,
  Coins,
  RefreshCw
} from "lucide-react";
import { CommitDetailsModal } from "@/_components/CommitDetailsModal";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { isConnected: isWalletAuthConnected, isLoading: isAuthLoading } = useWalletAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isVerifyingCommit, setIsVerifyingCommit] = useState(false);
  const [stats, setStats] = useState({
    totalRepositories: 0,
    pendingRepositories: 0,
    approvedRepositories: 0,
    totalCommits: 0,
    verifiedCommits: 0,
    totalDataCoinsEarned: 0
  });

  const { 
    repositories, 
    loading, 
    updateRepositoryStatus, 
    verifyCommit, 
    refetch 
  } = useRepositories(true); // Admin view

  // ALL useEffect HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (mounted && !isAuthLoading && !isWalletAuthConnected) {
      router.push("/signup");
    }
  }, [mounted, isAuthLoading, isWalletAuthConnected, router]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/repositories/stats');
        const data = await response.json();
        if (response.ok) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [repositories]);

  const handleRepositoryStatusUpdate = async (
    repoId: string, 
    status: 'pending' | 'approved' | 'rejected',
    dataCoinsEarned: number = 0
  ) => {
    if (!address) return;
    
    try {
      await updateRepositoryStatus(repoId, status, address, dataCoinsEarned);
      await refetch();
    } catch (error) {
      console.error('Error updating repository status:', error);
    }
  };

  const handleCommitVerification = async (
    repoId: string,
    commitSha: string,
    status: 'verified' | 'rejected',
    dataCoinsEarned: number = 0,
    verificationNotes?: string
  ) => {
    if (!address) return;
    
    setIsVerifyingCommit(true);
    try {
      await verifyCommit(repoId, commitSha, status, address, dataCoinsEarned, verificationNotes);
      await refetch();
      setIsCommitModalOpen(false);
      setSelectedCommit(null);
    } catch (error) {
      console.error('Error verifying commit:', error);
    } finally {
      setIsVerifyingCommit(false);
    }
  };

  const handleCommitClick = (commit: any) => {
    setSelectedCommit(commit);
    setIsCommitModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getCommitStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getCommitStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatCommitDate = (date: { seconds: number; nanoseconds?: number }) => {
    try {
      const timestamp = date.seconds * 1000;
      const commitDate = new Date(timestamp);
      if (isNaN(commitDate.getTime())) {
        return 'Invalid Date';
      }
      return commitDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Show loading while checking auth
  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting to signup
  if (!isWalletAuthConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  const selectedRepository = selectedRepo ? repositories.find(r => r.id === selectedRepo) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Manage repository submissions and verify commits
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <GitCommit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Repos</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.totalRepositories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingRepositories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Approved</h3>
                <p className="text-2xl font-bold text-green-600">{stats.approvedRepositories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">DataCoins</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDataCoinsEarned}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Repository List */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Submitted Repositories</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading repositories...</span>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No repositories submitted yet
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRepo === repo.id 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRepo(repo.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{repo.repoName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(repo.status)}`}>
                            {getStatusIcon(repo.status)}
                            <span className="ml-1 capitalize">{repo.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {repo.repoOwner} • {repo.language || 'Unknown'} • ⭐ {repo.stars || 0}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {repo.userName} (@{repo.githubUsername})
                          </span>
                          <span className="flex items-center gap-1">
                            <GitCommit className="h-3 w-3" />
                            {repo.verifiedCommits}/{repo.totalCommits}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {repo.dataCoinsEarned}
                          </span>
                        </div>
                      </div>
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repository Details & Commit Management */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            {selectedRepository ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRepository.repoName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(selectedRepository.status)} flex items-center gap-1`}>
                      {getStatusIcon(selectedRepository.status)}
                      <span className="capitalize">{selectedRepository.status}</span>
                    </span>
                    <a
                      href={selectedRepository.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on GitHub
                    </a>
                  </div>
                </div>

                {/* Repository Details */}
                <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Repository Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Repository</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner</span>
                          <span className="font-medium">{selectedRepository.repoOwner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Language</span>
                          <span className="font-medium">{selectedRepository.language || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stars</span>
                          <span className="font-medium flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {selectedRepository.stars || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Forks</span>
                          <span className="font-medium flex items-center gap-1">
                            <GitFork className="h-4 w-4 text-gray-500" />
                            {selectedRepository.forks || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Submitter</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name</span>
                          <span className="font-medium">{selectedRepository.userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email</span>
                          <span className="font-medium text-sm">{selectedRepository.userEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GitHub</span>
                          <span className="font-medium">@{selectedRepository.githubUsername}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submitted</span>
                          <span className="font-medium text-sm">
                            {new Date(selectedRepository.submittedAt.seconds * 1000).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">Progress</h4>
                      <span className="text-sm text-gray-600">
                        {selectedRepository.verifiedCommits}/{selectedRepository.totalCommits} commits
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${selectedRepository.totalCommits > 0 ? (selectedRepository.verifiedCommits / selectedRepository.totalCommits) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {selectedRepository.totalCommits > 0 
                          ? `${Math.round((selectedRepository.verifiedCommits / selectedRepository.totalCommits) * 100)}% Complete`
                          : 'No commits'
                        }
                      </span>
                      <span>{selectedRepository.dataCoinsEarned} DataCoins</span>
                    </div>
                  </div>
                </div>

                {/* Commits */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Commits ({selectedRepository.commits.length})
                  </h4>
                  {selectedRepository.commits.length === 0 ? (
                    <p className="text-gray-500 text-sm">No commits available</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedRepository.commits.map((commit) => (
                        <div
                          key={commit.sha}
                          className="p-3 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCommitClick(commit)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-gray-600">
                              {commit.sha.slice(0, 8)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getCommitStatusColor(commit.status)}`}>
                              {commit.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mb-2 line-clamp-1">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{commit.author}</span>
                            <span>{formatCommitDate(commit.date)}</span>
                            <span>+{commit.additions} -{commit.deletions}</span>
                            {commit.dataCoinsEarned > 0 && (
                              <span className="text-green-600 font-medium">
                                +{commit.dataCoinsEarned} DataCoins
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a repository to view details and manage commits
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commit Details Modal */}
      {selectedCommit && selectedRepository && (
        <CommitDetailsModal
          isOpen={isCommitModalOpen}
          onClose={() => {
            setIsCommitModalOpen(false);
            setSelectedCommit(null);
          }}
          commit={selectedCommit}
          repository={{
            repoOwner: selectedRepository.repoOwner,
            repoName: selectedRepository.repoName,
            githubUsername: selectedRepository.githubUsername
          }}
          onVerify={(sha, status, dataCoins, notes) => 
            handleCommitVerification(selectedRepository.id, sha, status, dataCoins, notes)
          }
          isVerifying={isVerifyingCommit}
        />
      )}
    </div>
  );
}