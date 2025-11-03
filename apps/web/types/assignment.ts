export interface AssignmentSubmissionData {
  assignmentId: string;
  submissionUrl: string;
  submissionType: "github" | "gitlab" | "drive" | "other";
}

export interface AssignmentSubmissionStatus {
  isSubmitted: boolean;
  submittedAt?: number;
  submissionUrl?: string;
  isVerified: boolean;
  verifiedAt?: number;
  feedback?: string;
}
