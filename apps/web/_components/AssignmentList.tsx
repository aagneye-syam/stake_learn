"use client";

import { CourseAssignment } from "@/services/course.service";
import { AssignmentCard } from "./AssignmentCard";

interface AssignmentListProps {
  assignments: CourseAssignment[];
  title?: string;
}

export function AssignmentList({ assignments, title = "Assignments" }: AssignmentListProps) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-sm">No assignments available for this course.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {title} ({assignments.length})
      </h3>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  );
}
