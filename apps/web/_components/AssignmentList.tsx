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

  // Load submission statuses
  useEffect(() => {
    const loadStatuses = async () => {
      if (!address) return;
      
      const statusMap = new Map<string, boolean>();
      for (const assignment of assignments) {
        if (assignment.id) {
          const status = await getAssignmentStatus(address, courseId, assignment.id);
          statusMap.set(assignment.id, status?.isSubmitted || false);
        }
      }
      setSubmissionStatuses(statusMap);
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
      console.log("Assignment submitted successfully!");
      
      // Update status
      setSubmissionStatuses(prev => new Map(prev).set(data.assignmentId, true));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      alert("Failed to submit assignment");
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
