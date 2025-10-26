"use client";

import { useState, useEffect } from 'react';
import { githubService, GitHubCommit, GitHubRepository } from '@/_utils/github';
import { motion } from 'framer-motion';
import { 
  Github, 
  Calendar, 
  User, 
  FileText, 
  Plus, 
  Minus, 
  Code, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface CommitDetailsProps {
  repoUrl: string;
  commitSha: string;
  onVerify: (verified: boolean) => void;
  onCancel: () => void;
}

export function CommitDetails({ repoUrl, commitSha, onVerify, onCancel }: CommitDetailsProps) {
  const [commit, setCommit] = useState<GitHubCommit | null>(null);
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCommitDetails();
  }, [repoUrl, commitSha]);

  const fetchCommitDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse repository URL
      const parsed = githubService.parseRepositoryUrl(repoUrl);
      if (!parsed) {
        throw new Error('Invalid repository URL format');
      }

      // Fetch commit and repository details in parallel
      const [commitData, repoData] = await Promise.all([
        githubService.getCommit(parsed.owner, parsed.repo, commitSha),
        githubService.getRepository(parsed.owner, parsed.repo)
      ]);

      setCommit(commitData);
      setRepository(repoData);
    } catch (err) {
      console.error('Error fetching commit details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch commit details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (index: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFiles(newSelected);
  };

  const handleVerify = () => {
    onVerify(true);
  };

  const handleReject = () => {
    onVerify(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading commit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Error Loading Commit</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={fetchCommitDetails}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (!commit || !repository) {
    return null;
  }

  const fileChanges = githubService.formatFileChanges(commit.files);

  return (
    <div className="space-y-6">
      {/* Repository Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Github className="w-6 h-6 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {repository.full_name}
            </h3>
            <p className="text-sm text-gray-600">{repository.description}</p>
          </div>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Code className="w-4 h-4" />
            {repository.language || 'Unknown'}
          </span>
          <span>⭐ {repository.stargazers_count}</span>
          <span>🍴 {repository.forks_count}</span>
        </div>
      </div>

      {/* Commit Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {githubService.formatCommitMessage(commit.commit.message)}
            </h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {commit.commit.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(commit.commit.author.date).toLocaleDateString()}
              </span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {commit.sha.substring(0, 7)}
              </span>
            </div>
          </div>
          <a
            href={commit.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {/* Commit Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">+{commit.stats.additions}</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-red-600" />
            <span className="text-red-600 font-medium">-{commit.stats.deletions}</span>
          </div>
          <div className="text-gray-600">
            {commit.stats.total} changes in {commit.files.length} files
          </div>
        </div>
      </div>

      {/* File Changes */}
      <div className="space-y-3">
        <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Files Changed ({commit.files.length})
        </h5>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {fileChanges.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedFiles.has(index)
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFileSelect(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 ${
                    selectedFiles.has(index)
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedFiles.has(index) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="font-mono text-sm text-gray-900">
                    {file.filename}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    file.status === 'added' ? 'bg-green-100 text-green-700' :
                    file.status === 'modified' ? 'bg-yellow-100 text-yellow-700' :
                    file.status === 'deleted' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {file.status}
                  </span>
                </div>
                <span className="text-sm font-mono text-gray-600">
                  {file.changes}
                </span>
              </div>
              
              {/* Show patch if file is selected */}
              {selectedFiles.has(index) && file.patch && (
                <div className="mt-3 p-3 bg-gray-900 rounded text-xs font-mono text-green-400 overflow-x-auto">
                  <pre>{file.patch}</pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedFiles.size > 0 ? (
            <span className="text-purple-600 font-medium">
              {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected for verification
            </span>
          ) : (
            <span>Select files to verify their changes</span>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={selectedFiles.size === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Verify & Mint SBT
          </button>
        </div>
      </div>
    </div>
  );
}
