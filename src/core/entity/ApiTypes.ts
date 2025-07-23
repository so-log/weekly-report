// Domain Types - Core Entities
export interface User {
  id: string;
  email: string;
  name: string;
  role?: "admin" | "user" | "manager";
  team_id?: string | null;
}

// Report Domain Types
export interface Task {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed" | "delayed";
  startDate: string;
  dueDate: string;
  notes: string;
  planDetail?: string;
  type?: "current" | "next";
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  status: "in-progress" | "completed" | "delayed";
  tasks: Task[];
}

export interface Achievement {
  id: string;
  project: string; // 업무 항목
  issue: string; // 이슈 설명
  dueDate: string; // 목표 완료일
}

export interface IssueRisk {
  id: string;
  issueDescription: string; // 발생한 문제
  mitigationPlan: string; // 대응 방안
}

export interface Report {
  id: string;
  weekStart: string; // API에서는 ISO 문자열로 전송
  weekEnd: string;
  projects: Project[];
  issuesRisks: IssueRisk[];
  createdAt: string;
  updatedAt: string;
}

// 클라이언트에서 사용할 Report 타입 (Date 객체 사용)
export interface ClientReport {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  projects: Project[];
  issuesRisks: IssueRisk[];
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// Admin Domain Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
  joinedAt: string;
}

export interface AdminReport {
  id: string;
  member: TeamMember;
  title: string;
  content: string;
  weekStart: string;
  weekEnd: string;
  submittedAt: string | null;
  status: "submitted" | "missing" | "review" | "approved";
  projects: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
  achievements: Array<{
    id: string;
    project: string;
    description: string;
    priority: string;
  }>;
}

export interface AdminStatistics {
  totalReports: number;
  submittedReports: number;
  missingReports: number;
  reviewReports: number;
  approvedReports: number;
  submissionRate: number;
  departments: Array<{
    name: string;
    totalMembers: number;
    submittedReports: number;
    submissionRate: number;
  }>;
}