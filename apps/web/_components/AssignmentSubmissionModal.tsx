"use client";

import { useState } from "react";
import { X, Github, GitBranch, HardDrive, Link2, Loader2 } from "lucide-react";
import { AssignmentSubmissionData } from "@/types/assignment";

interface AssignmentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentSubmissionData) => Promise<void>;
  assignmentId: string;
  assignmentTitle: string;
}

export function AssignmentSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  assignmentId,
  assignmentTitle,
}: AssignmentSubmissionModalProps) {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionType, setSubmissionType] = useState<"github" | "gitlab" | "drive" | "other">("github");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!submissionUrl.trim()) {
      setError("Please enter a submission URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(submissionUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        assignmentId,
        submissionUrl: submissionUrl.trim(),
        submissionType,
      });
      setSubmissionUrl("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubmissionUrl("");
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Submit Assignment
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Assignment: <span className="font-semibold text-gray-900 dark:text-white">{assignmentTitle}</span>
            </p>
          </div>

          {/* Submission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Submission Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSubmissionType("github")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  submissionType === "github"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <Github className="h-5 w-5" />
                <span className="text-sm font-medium">GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType("gitlab")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  submissionType === "gitlab"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <GitBranch className="h-5 w-5" />
                <span className="text-sm font-medium">GitLab</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType("drive")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  submissionType === "drive"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <HardDrive className="h-5 w-5" />
                <span className="text-sm font-medium">Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType("other")}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  submissionType === "other"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <Link2 className="h-5 w-5" />
                <span className="text-sm font-medium">Other</span>
              </button>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="submissionUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Submission URL *
            </label>
            <input
              type="url"
              id="submissionUrl"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder={
                submissionType === "github"
                  ? "https://github.com/username/repo"
                  : submissionType === "gitlab"
                  ? "https://gitlab.com/username/repo"
                  : submissionType === "drive"
                  ? "https://drive.google.com/..."
                  : "https://..."
              }
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
              required
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Make sure your repository/link is publicly accessible or shared with your instructor.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
