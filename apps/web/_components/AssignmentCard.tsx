"use client";

import { CourseAssignment } from "@/services/course.service";
import { FileText, GitBranch } from "lucide-react";

interface AssignmentCardProps {
  assignment: CourseAssignment;
  showRepoSubmission?: boolean;
}

export function AssignmentCard({ assignment, showRepoSubmission = true }: AssignmentCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{assignment.heading}</h3>
            {assignment.allowRepoSubmission && showRepoSubmission && (
              <div className="flex items-center gap-1 text-sm text-purple-600 mt-1">
                <GitBranch className="h-4 w-4" />
                <span>Repository submission enabled</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm whitespace-pre-wrap">{assignment.description}</p>
    </div>
  );
}
