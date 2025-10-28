"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface Repository {
  id: string;
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
  submittedAt: { seconds: number; nanoseconds: number };
  reviewedAt?: { seconds: number; nanoseconds: number };
  reviewedBy?: string;
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
  date: { seconds: number; nanoseconds: number };
  additions: number;
  deletions: number;
  filesChanged: string[];
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: { seconds: number; nanoseconds: number };
  verifiedBy?: string;
  dataCoinsEarned: number;
  verificationNotes?: string;
}

export function useRepositories(adminView: boolean = false) {
  const { address } = useAccount();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    if (!address) {
      setRepositories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const url = adminView 
        ? `/api/repositories?userAddress=${address}&admin=true`
        : `/api/repositories?userAddress=${address}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch repositories');
      }
      
      setRepositories(data.repositories || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  }, [address, adminView]);

  const submitRepository = useCallback(async (
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
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          repoUrl,
          repoData
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit repository');
      }
      
      // Refresh repositories after successful submission
      await fetchRepositories();
      
      return data;
    } catch (err: any) {
      console.error('Error submitting repository:', err);
      throw err;
    }
  }, [address, fetchRepositories]);

  const addCommitsToRepository = useCallback(async (
    repoId: string,
    commits: Omit<Commit, 'status' | 'dataCoinsEarned' | 'verifiedAt' | 'verifiedBy'>[]
  ) => {
    try {
      const response = await fetch(`/api/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addCommits',
          commits
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add commits');
      }
      
      // Refresh repositories after successful update
      await fetchRepositories();
      
      return data;
    } catch (err: any) {
      console.error('Error adding commits:', err);
      throw err;
    }
  }, [fetchRepositories]);

  const verifyCommit = useCallback(async (
    repoId: string,
    commitSha: string,
    status: 'verified' | 'rejected',
    verifiedBy: string,
    dataCoinsEarned: number = 0,
    verificationNotes?: string
  ) => {
    try {
      const response = await fetch(`/api/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verifyCommit',
          commitSha,
          status,
          verifiedBy,
          dataCoinsEarned,
          verificationNotes
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify commit');
      }
      
      // Refresh repositories after successful verification
      await fetchRepositories();
      
      return data;
    } catch (err: any) {
      console.error('Error verifying commit:', err);
      throw err;
    }
  }, [fetchRepositories]);

  const updateRepositoryStatus = useCallback(async (
    repoId: string,
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy: string,
    dataCoinsEarned: number = 0
  ) => {
    try {
      const response = await fetch(`/api/repositories/${repoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateStatus',
          status,
          reviewedBy,
          dataCoinsEarned
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update repository status');
      }
      
      // Refresh repositories after successful update
      await fetchRepositories();
      
      return data;
    } catch (err: any) {
      console.error('Error updating repository status:', err);
      throw err;
    }
  }, [fetchRepositories]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return {
    repositories,
    loading,
    error,
    submitRepository,
    addCommitsToRepository,
    verifyCommit,
    updateRepositoryStatus,
    refetch: fetchRepositories
  };
}
