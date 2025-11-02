export interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  category: string;
  requiredStake: string;
  status?: "Not Started" | "In Progress" | "Completed";
  icon: string;
  modules?: string[];
  createdAt?: any;
  updatedAt?: any;
}
