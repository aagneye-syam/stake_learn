export interface CertificateData {
  studentAddress: string;
  courseId: number;
  courseName: string;
  completedAt: number;
  stakeAmount: string;
  modules: Array<{
    id: number;
    title: string;
    lessons: number;
    duration: string;
  }>;
  signature?: string;
}

export interface CertificateMetadata {
  cid: string;
  studentAddress: string;
  courseId: number;
  uploadedAt: number;
  lighthouseUrl: string;
  courseName?: string;
  completionDate?: string;
  modules?: Array<{
    id: number;
    title: string;
    lessons: number;
    duration: string;
  }>;
  stakeAmount?: string;
  completedAt?: number;
}

export interface DataCoinReward {
  amount: string;
  tokenAddress: string;
  transactionHash?: string;
  timestamp: number;
}

export interface UserAchievement {
  certificates: CertificateMetadata[];
  totalDataCoinsEarned: string;
  rewards: DataCoinReward[];
  totalCoursesCompleted: number;
}
