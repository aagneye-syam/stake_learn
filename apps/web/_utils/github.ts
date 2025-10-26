// GitHub API utilities for fetching commit details
export interface GitHubCommit {
  sha: string;
  commit: {
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
  };
  html_url: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}

export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';

  // Fetch commit details from GitHub API
  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Proof-of-Contribution-App'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching commit from GitHub:', error);
      throw error;
    }
  }

  // Fetch repository details
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Proof-of-Contribution-App'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository from GitHub:', error);
      throw error;
    }
  }

  // Parse repository URL to extract owner and repo name
  parseRepositoryUrl(repoUrl: string): { owner: string; repo: string } | null {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/,
        /^([^\/]+)\/([^\/]+)$/
      ];

      for (const pattern of patterns) {
        const match = repoUrl.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, '')
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing repository URL:', error);
      return null;
    }
  }

  // Format commit message for display
  formatCommitMessage(message: string): string {
    // Take first line of commit message
    return message.split('\n')[0];
  }

  // Format file changes for display
  formatFileChanges(files: GitHubCommit['files']): Array<{
    filename: string;
    status: string;
    changes: string;
    patch?: string;
  }> {
    return files.map(file => ({
      filename: file.filename,
      status: file.status,
      changes: `${file.additions > 0 ? `+${file.additions}` : ''}${file.deletions > 0 ? `-${file.deletions}` : ''}`,
      patch: file.patch
    }));
  }
}

// Export singleton instance
export const githubService = new GitHubService();
