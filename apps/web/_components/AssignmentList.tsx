"use client";

import { useState, useEffect } from "react";
import { CourseAssignment } from "@/services/course.service";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentSubmissionModal } from "./AssignmentSubmissionModal";
import { submitAssignment, getAssignmentStatus } from "@/services/assignment.service";
import { AssignmentSubmissionData } from "@/types/assignment";
import { useAccount } from "wagmi";

interface AssignmentListProps {
  assignments: CourseAssignment[];
  courseId: number;
  title?: string;
}

export function AssignmentList({ assignments, courseId, title = "Assignments" }: AssignmentListProps) {
  const { address } = useAccount();
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [submissionStatuses, setSubmissionStatuses] = useState<Map<string, boolean>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load submission statuses
  useEffect(() => {
    const loadStatuses = async () => {
      if (!address) return;
      
      setIsLoading(true);
      const statusMap = new Map<string, boolean>();
      for (const assignment of assignments) {
        if (assignment.id) {
          const status = await getAssignmentStatus(address, courseId, assignment.id);
          statusMap.set(assignment.id, status?.isSubmitted || false);
        }
      }
      setSubmissionStatuses(statusMap);
      setIsLoading(false);
    };

    loadStatuses();
  }, [address, assignments, courseId]);

  const handleSubmitClick = (assignment: CourseAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: AssignmentSubmissionData) => {
    if (!address) {
      alert("Please connect your wallet");
      return;
    }

    try {
      await submitAssignment(address, courseId, data);
      
      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in";
      successMessage.textContent = "✓ Assignment submitted successfully!";
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
      
      // Update status
      setSubmissionStatuses(prev => new Map(prev).set(data.assignmentId, true));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      alert("Failed to submit assignment. Please try again.");
      throw error;
    }
  };

  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-sm">No assignments available for this course.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {title} ({assignments.length})
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading submission status...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
                onSubmitClick={() => handleSubmitClick(assignment)}
                isSubmitted={submissionStatuses.get(assignment.id || "") || false}
              />
            ))}
          </div>
        )}
      </div>

      {selectedAssignment && (
        <AssignmentSubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          assignmentId={selectedAssignment.id || ""}
          assignmentTitle={selectedAssignment.heading}
        />
      )}
    </>
  );
}
