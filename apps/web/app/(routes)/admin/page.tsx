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

                {/* Repository Details Card */}
                <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Repository Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Repository Information</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Owner</span>
                          </div>
                          <span className="font-semibold text-gray-900">{selectedRepository.repoOwner}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Language</span>
                          </div>
                          <span className="font-semibold text-gray-900">{selectedRepository.language || 'Unknown'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Stars</span>
                          </div>
                          <span className="font-semibold text-gray-900 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {selectedRepository.stars || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Forks</span>
                          </div>
                          <span className="font-semibold text-gray-900 flex items-center gap-2">
                            <GitFork className="h-4 w-4 text-gray-500" />
                            {selectedRepository.forks || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Submitter Information</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Name</span>
                          </div>
                          <span className="font-semibold text-gray-900">{selectedRepository.userName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Email</span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{selectedRepository.userEmail}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">GitHub Username</span>
                          </div>
                          <span className="font-semibold text-gray-900">@{selectedRepository.githubUsername}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-purple-100">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Submitted</span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {new Date(selectedRepository.submittedAt.seconds * 1000).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Verification Progress</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedRepository.verifiedCommits}
                          </div>
                          <div className="text-sm text-gray-600">Verified Commits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedRepository.totalCommits}
                          </div>
                          <div className="text-sm text-gray-600">Total Commits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {selectedRepository.dataCoinsEarned}
                          </div>
                          <div className="text-sm text-gray-600">DataCoins Earned</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {selectedRepository.totalCommits > 0 
                              ? `${Math.round((selectedRepository.verifiedCommits / selectedRepository.totalCommits) * 100)}% Complete`
                              : 'No commits to verify'
                            }
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-700 shadow-sm"
                            style={{ 
                              width: `${selectedRepository.totalCommits > 0 ? (selectedRepository.verifiedCommits / selectedRepository.totalCommits) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commits */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Commits ({selectedRepository.commits.length})
                  </h4>
                  {selectedRepository.commits.length === 0 ? (
                    <p className="text-gray-500 text-sm">No commits available</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedRepository.commits.map((commit) => (
                        <div
                          key={commit.sha}
                          className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                          onClick={() => handleCommitClick(commit)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border">
                                  {commit.sha.slice(0, 8)}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getCommitStatusColor(commit.status)} flex items-center gap-1`}>
                                  {getCommitStatusIcon(commit.status)}
                                  <span className="capitalize">{commit.status}</span>
                                </span>
                                {commit.dataCoinsEarned > 0 && (
                                  <span className="text-green-700 font-semibold text-xs bg-green-100 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                                    <Coins className="h-3 w-3" />
                                    +{commit.dataCoinsEarned} DataCoins
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">
                                {commit.message}
                              </p>
                              
                              <div className="flex items-center gap-6 text-xs text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {commit.author}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatCommitDate(commit.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="text-green-600 font-medium">+{commit.additions}</span>
                                  <span className="text-red-600 font-medium">-{commit.deletions}</span>
                                </span>
                                <span className="text-gray-500">
                                  {commit.filesChanged.length} files
                                </span>
                              </div>
                              
                              {/* Files Changed Preview */}
                              {commit.filesChanged.length > 0 && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs text-gray-600 mb-2 font-medium">Files changed:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {commit.filesChanged.slice(0, 4).map((file, index) => (
                                      <span
                                        key={index}
                                        className="text-xs bg-white text-gray-700 px-2 py-1 rounded border"
                                      >
                                        {file}
                                      </span>
                                    ))}
                                    {commit.filesChanged.length > 4 && (
                                      <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded border">
                                        +{commit.filesChanged.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-4 flex items-center gap-2">
                              <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                                <ExternalLink className="h-4 w-4" />
                              </div>
                              <div className="text-xs text-gray-500">
                                Click to view
                              </div>
                            </div>
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