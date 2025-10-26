"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, User, Calendar, GitCommit, FileText, Plus, Minus, ExternalLink, Loader2, ChevronDown, ChevronRight } from "lucide-react";

interface CommitFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface CommitDetails {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: CommitFile[];
  html_url: string;
}

interface CommitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  commit: {
    sha: string;
    message: string;
    author: string;
    date: { seconds: number; nanoseconds?: number };
    additions: number;
    deletions: number;
    filesChanged: string[];
    status: 'pending' | 'verified' | 'rejected';
    dataCoinsEarned: number;
  };
  repository: {
    repoOwner: string;
    repoName: string;
    githubUsername: string;
  };
  onVerify: (sha: string, status: 'verified' | 'rejected', dataCoins: number, notes?: string) => void;
  isVerifying?: boolean;
}

export function CommitDetailsModal({
  isOpen,
  onClose,
  commit,
  repository,
  onVerify,
  isVerifying = false
}: CommitDetailsModalProps) {
  const [commitDetails, setCommitDetails] = useState<CommitDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && commit) {
      fetchCommitDetails();
    }
  }, [isOpen, commit]);

  const fetchCommitDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.github.com/repos/${repository.repoOwner}/${repository.repoName}/commits/${commit.sha}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch commit details: ${response.status}`);
      }
      
      const data = await response.json();
      setCommitDetails(data);
    } catch (err: any) {
      console.error('Error fetching commit details:', err);
      setError(err.message || 'Failed to fetch commit details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (status: 'verified' | 'rejected') => {
    const dataCoins = status === 'verified' ? 5 : 0;
    onVerify(commit.sha, status, dataCoins, verificationNotes);
    setVerificationNotes("");
    setShowNotes(false);
  };

  const toggleFileExpansion = (index: number) => {
    const newExpandedFiles = new Set(expandedFiles);
    if (newExpandedFiles.has(index)) {
      newExpandedFiles.delete(index);
    } else {
      newExpandedFiles.add(index);
    }
    setExpandedFiles(newExpandedFiles);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getFileStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="h-3 w-3 text-green-600" />;
      case 'removed':
        return <Minus className="h-3 w-3 text-red-600" />;
      case 'modified':
        return <FileText className="h-3 w-3 text-blue-600" />;
      case 'renamed':
        return <ExternalLink className="h-3 w-3 text-yellow-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'removed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'modified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'renamed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPatch = (patch: string) => {
    if (!patch) return null;
    
    const lines = patch.split('\n');
    return lines.map((line, index) => {
      const isAddition = line.startsWith('+');
      const isDeletion = line.startsWith('-');
      const isContext = line.startsWith(' ');
      
      return (
        <div
          key={index}
          className={`font-mono text-xs ${
            isAddition ? 'bg-green-50 text-green-800' :
            isDeletion ? 'bg-red-50 text-red-800' :
            isContext ? 'text-gray-600' : 'text-gray-500'
          }`}
        >
          {line}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <GitCommit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Commit Details</h2>
              <p className="text-sm text-gray-600">
                {repository.repoOwner}/{repository.repoName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-3 text-gray-600">Loading commit details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <XCircle className="h-12 w-12 mx-auto mb-2" />
                <p className="font-medium">Failed to load commit details</p>
                <p className="text-sm text-gray-600 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchCommitDetails}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : commitDetails ? (
            <div className="space-y-6">
              {/* Commit Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {commitDetails.message}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {commitDetails.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(commitDetails.author.date)}
                      </span>
                      <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                        {commitDetails.sha.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <a
                    href={commitDetails.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">+{commitDetails.stats.additions}</div>
                    <div className="text-gray-600">Additions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold">-{commitDetails.stats.deletions}</div>
                    <div className="text-gray-600">Deletions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-600 font-semibold">{commitDetails.stats.total}</div>
                    <div className="text-gray-600">Total Changes</div>
                  </div>
                </div>
              </div>

              {/* Files Changed */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Files Changed ({commitDetails.files.length})
                </h4>
                <div className="space-y-2">
                  {commitDetails.files.map((file, index) => {
                    const isExpanded = expandedFiles.has(index);
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleFileExpansion(index)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            {getFileStatusIcon(file.status)}
                            <span className="font-medium text-gray-900 truncate">{file.filename}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getFileStatusColor(file.status)}`}>
                              {file.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-green-600">+{file.additions}</span>
                            <span className="text-red-600">-{file.deletions}</span>
                          </div>
                        </div>
                        
                        {/* File Patch - Only show when expanded */}
                        {isExpanded && file.patch && (
                          <div className="border-t border-gray-200 p-4">
                            <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                              <div className="text-white text-xs font-mono">
                                {formatPatch(file.patch)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 flex-shrink-0 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-600">
                GitHub User: <span className="font-medium">{repository.githubUsername}</span>
              </span>
              {commit.dataCoinsEarned > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  +{commit.dataCoinsEarned} DataCoins earned
                </span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {!showNotes && (
                <button
                  onClick={() => setShowNotes(true)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm self-start"
                >
                  Add Notes
                </button>
              )}
              
              {showNotes && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Verification notes..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 sm:flex-none sm:w-48"
                  />
                  <button
                    onClick={() => setShowNotes(false)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleVerify('rejected')}
                  disabled={isVerifying}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject
                </button>
                
                <button
                  onClick={() => handleVerify('verified')}
                  disabled={isVerifying}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Verify (+5 DataCoins)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
