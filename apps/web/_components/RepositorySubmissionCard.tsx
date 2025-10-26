"use client";

import { useState } from "react";
import { useRepositories } from "@/hooks/useRepositories";
import { useAccount } from "wagmi";
import { Loader2, Plus, ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";

interface RepositorySubmissionCardProps {
  onRepositoryAdded?: () => void;
}

export function RepositorySubmissionCard({ onRepositoryAdded }: RepositorySubmissionCardProps) {
  const { address } = useAccount();
  const { repositories, loading, submitRepository } = useRepositories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const parseGitHubUrl = (url: string) => {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/,
        /^([^\/]+)\/([^\/]+)$/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            owner: match[1],
            name: match[2].replace(/\.git$/, ''), // Remove .git suffix
            isValid: true
          };
        }
      }
      
      return { isValid: false };
    } catch {
      return { isValid: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const parsed = parseGitHubUrl(repoUrl);
      if (!parsed.isValid) {
        throw new Error("Invalid GitHub repository URL. Please enter a valid GitHub URL or owner/repo format.");
      }

      // Fetch repository data from GitHub API
      const githubResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.name}`);
      if (!githubResponse.ok) {
        throw new Error("Repository not found or not accessible. Please check the URL and try again.");
      }
      
      const repoData = await githubResponse.json();
      
      // Submit to our API
      const result = await submitRepository(repoUrl, {
        name: repoData.name,
        owner: repoData.owner.login,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        isPrivate: repoData.private,
        githubUsername: githubUsername || repoData.owner.login
      });

      setSuccess(result.message);
      setRepoUrl("");
      onRepositoryAdded?.();
    } catch (err: any) {
      setError(err.message || "Failed to submit repository");
    } finally {
      setIsSubmitting(false);
    }
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600">Loading repositories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-black">
          Submit Repository
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-black focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            placeholder="https://github.com/owner/repo or owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the full GitHub URL or just owner/repo format
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Username (Optional)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-black focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
            placeholder="Your GitHub username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your GitHub username for verification (will auto-detect from repo if not provided)
          </p>
        </div>

        <button
          type="submit"
          disabled={!address || isSubmitting || !repoUrl}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Submit Repository
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border-2 border-red-200">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 rounded-xl bg-green-50 border-2 border-green-200">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Submitted Repositories */}
      {repositories.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Submitted Repositories</h3>
          <div className="space-y-3">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
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
                    {repo.description && (
                      <p className="text-sm text-gray-500 mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Commits: {repo.verifiedCommits}/{repo.totalCommits}</span>
                      <span>DataCoins: {repo.dataCoinsEarned}</span>
                      <span>
                        Submitted: {new Date(repo.submittedAt.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
