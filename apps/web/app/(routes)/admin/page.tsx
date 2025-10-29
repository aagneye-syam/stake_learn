"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRepositories } from "@/hooks/useRepositories";
import type { Repository, Commit } from "@/services/repository.service";
import { useAdminAuth } from "@/_context/AdminAuthContext";
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
import { listCourses, upsertCourse, toggleCourseRepoSubmission, updateCourseStakeAmount, deleteCourse, CourseData, CourseModule } from "@/services/course.service";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { isAdminAuthed, isLoading: isAdminLoading, logout } = useAdminAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isVerifyingCommit, setIsVerifyingCommit] = useState(false);
  const [viewMode, setViewMode] = useState<'repositories' | 'users' | 'courses'>('repositories');
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState<{ id: number | ''; title: string; description: string; stakeAmount: string; allowRepoSubmission: boolean; modules: CourseModule[]; active: boolean }>({ id: '', title: '', description: '', stakeAmount: '0.0001', allowRepoSubmission: false, modules: [{ id: 1, title: 'Module 1' }], active: true });
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

  // Redirect to admin login if not admin-authenticated
  useEffect(() => {
    if (mounted && !isAdminLoading && !isAdminAuthed) {
      router.push("/admin/login");
    }
  }, [mounted, isAdminLoading, isAdminAuthed, router]);

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

  // Fetch courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await listCourses(false);
        setCourses(list);
      } catch (e) {
        console.error('Failed to load courses', e);
      }
    };
    loadCourses();
  }, []);

  const resetCourseForm = () => setCourseForm({ id: '', title: '', description: '', stakeAmount: '0.0001', allowRepoSubmission: false, modules: [{ id: 1, title: 'Module 1' }], active: true });

  const handleSaveCourse = async () => {
    if (!courseForm.id || !courseForm.title) return;
    setIsSavingCourse(true);
    try {
      await upsertCourse({
        id: Number(courseForm.id),
        title: courseForm.title,
        description: courseForm.description,
        stakeAmount: courseForm.stakeAmount,
        allowRepoSubmission: courseForm.allowRepoSubmission,
        modules: courseForm.modules,
        active: courseForm.active,
      });
      const list = await listCourses(false);
      setCourses(list);
      resetCourseForm();
    } catch (e) {
      console.error('Failed to save course', e);
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleEditCourse = (c: CourseData) => {
    setCourseForm({
      id: c.id,
      title: c.title,
      description: c.description,
      stakeAmount: c.stakeAmount,
      allowRepoSubmission: c.allowRepoSubmission,
      modules: c.modules,
      active: c.active ?? true,
    });
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await deleteCourse(id);
      setCourses(await listCourses(false));
    } catch (e) {
      console.error('Failed to delete course', e);
    }
  };

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

  // Group repositories by user
  const repositoriesByUser = repositories.reduce((acc, repo) => {
    const userKey = `${repo.userName} (${repo.userEmail})`;
    if (!acc[userKey]) {
      acc[userKey] = {
        user: {
          name: repo.userName,
          email: repo.userEmail,
          githubUsername: repo.githubUsername,
          walletAddress: repo.userAddress
        },
        repositories: []
      };
    }
    acc[userKey].repositories.push(repo as any);
    return acc;
  }, {} as Record<string, { user: any; repositories: any[] }>);

  // Calculate user stats
  const getUserStats = (userRepos: any[]) => {
    const totalRepos = userRepos.length;
    const pendingRepos = userRepos.filter(r => r.status === 'pending').length;
    const approvedRepos = userRepos.filter(r => r.status === 'approved').length;
    const totalCommits = userRepos.reduce((sum, r) => sum + r.totalCommits, 0);
    const verifiedCommits = userRepos.reduce((sum, r) => sum + r.verifiedCommits, 0);
    const totalDataCoins = userRepos.reduce((sum, r) => sum + r.dataCoinsEarned, 0);
    
    return {
      totalRepos,
      pendingRepos,
      approvedRepos,
      totalCommits,
      verifiedCommits,
      totalDataCoins,
      completionRate: totalCommits > 0 ? Math.round((verifiedCommits / totalCommits) * 100) : 0
    };
  };

  // Show loading while checking auth
  if (!mounted || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting to signup
  if (!isAdminAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to admin login...</p>
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
              onClick={() => { logout(); router.push('/admin/login'); }}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              Logout
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

        {/* View Toggle */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">View Mode:</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('repositories')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'repositories'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Repository
              </button>
              <button
                onClick={() => setViewMode('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'users'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By User
              </button>
              <button
                onClick={() => setViewMode('courses')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'courses'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Courses
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Repository/User List */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {viewMode === 'repositories' ? 'Submitted Repositories' : viewMode === 'users' ? 'Users & Their Repositories' : 'Courses'}
            </h3>
            
            {viewMode === 'courses' ? (
              <div className="space-y-6">
                {/* Course Form */}
                <div className="border rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Course ID</label>
                      <input value={courseForm.id} onChange={(e) => setCourseForm({ ...courseForm, id: (e.target.value as any) })} placeholder="Numeric ID" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Stake Amount (ETH)</label>
                      <input value={courseForm.stakeAmount} onChange={(e) => setCourseForm({ ...courseForm, stakeAmount: e.target.value })} placeholder="0.0001" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Title</label>
                      <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Course title" className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Description</label>
                      <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description" className="w-full px-3 py-2 border rounded-lg"></textarea>
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="allowRepo" type="checkbox" checked={courseForm.allowRepoSubmission} onChange={(e) => setCourseForm({ ...courseForm, allowRepoSubmission: e.target.checked })} />
                      <label htmlFor="allowRepo" className="text-sm text-gray-700">Enable Repository Submissions</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="activeCourse" type="checkbox" checked={courseForm.active} onChange={(e) => setCourseForm({ ...courseForm, active: e.target.checked })} />
                      <label htmlFor="activeCourse" className="text-sm text-gray-700">Active</label>
                    </div>
                  </div>
                  {/* Modules */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Modules</h4>
                      <button onClick={() => setCourseForm({ ...courseForm, modules: [...courseForm.modules, { id: courseForm.modules.length + 1, title: `Module ${courseForm.modules.length + 1}` }] })} className="px-3 py-1 text-sm rounded-lg bg-gray-800 text-white">Add Module</button>
                    </div>
                    <div className="space-y-2">
                      {courseForm.modules.map((m, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input value={m.title} onChange={(e) => {
                            const copy = [...courseForm.modules];
                            copy[idx] = { ...copy[idx], title: e.target.value };
                            setCourseForm({ ...courseForm, modules: copy });
                          }} className="px-3 py-2 border rounded-lg" placeholder={`Module ${m.id} title`} />
                          <input value={m.duration || ''} onChange={(e) => {
                            const copy = [...courseForm.modules];
                            copy[idx] = { ...copy[idx], duration: e.target.value };
                            setCourseForm({ ...courseForm, modules: copy });
                          }} className="px-3 py-2 border rounded-lg" placeholder="Duration (e.g., 2 hours)" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={handleSaveCourse} disabled={isSavingCourse} className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">{isSavingCourse ? 'Saving...' : 'Save Course'}</button>
                    <button onClick={resetCourseForm} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">Reset</button>
                  </div>
                </div>

                {/* Courses List */}
                <div className="border rounded-xl p-4">
                  {courses.length === 0 ? (
                    <div className="text-sm text-gray-500">No courses found</div>
                  ) : (
                    <div className="space-y-3">
                      {courses.map((c) => (
                        <div key={c.id} className="p-3 border rounded-lg flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{c.title} <span className="text-xs text-gray-500">(ID: {c.id})</span></div>
                            <div className="text-xs text-gray-600">Stake: {c.stakeAmount} ETH • Modules: {c.totalModules} • Repo Submissions: {c.allowRepoSubmission ? 'Enabled' : 'Disabled'}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditCourse(c)} className="px-3 py-1 text-sm rounded-lg bg-white border hover:bg-gray-50">Edit</button>
                            <button onClick={() => toggleCourseRepoSubmission(c.id, !c.allowRepoSubmission).then(async () => setCourses(await listCourses(false)))} className="px-3 py-1 text-sm rounded-lg bg-white border hover:bg-gray-50">{c.allowRepoSubmission ? 'Disable Repo' : 'Enable Repo'}</button>
                            <button onClick={() => handleDeleteCourse(c.id)} className="px-3 py-1 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading repositories...</span>
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No repositories submitted yet
              </div>
            ) : viewMode === 'repositories' ? (
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
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {Object.entries(repositoriesByUser).map(([userKey, userData]) => {
                  const userStats = getUserStats(userData.repositories);
                  return (
                    <div key={userKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{userData.user.name}</h4>
                          <p className="text-sm text-gray-600">{userData.user.email}</p>
                          <p className="text-xs text-gray-500">@{userData.user.githubUsername}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {userStats.completionRate}% Complete
                          </div>
                          <div className="text-xs text-gray-500">
                            {userStats.verifiedCommits}/{userStats.totalCommits} commits
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-blue-600">{userStats.totalRepos}</div>
                          <div className="text-xs text-gray-500">Repositories</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{userStats.approvedRepos}</div>
                          <div className="text-xs text-gray-500">Approved</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{userStats.totalDataCoins}</div>
                          <div className="text-xs text-gray-500">DataCoins</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {userData.repositories.map((repo) => (
                          <div
                            key={repo.id}
                            className={`p-3 rounded border cursor-pointer transition-all ${
                              selectedRepo === repo.id 
                                ? 'border-purple-300 bg-purple-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedRepo(repo.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-gray-900">{repo.repoName}</h5>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(repo.status)}`}>
                                    {repo.status}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {repo.verifiedCommits}/{repo.totalCommits} commits • {repo.dataCoinsEarned} DataCoins
                                </p>
                              </div>
                              <a
                                href={repo.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-400 hover:text-gray-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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