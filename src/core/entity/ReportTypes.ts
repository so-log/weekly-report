export interface Task {
  id?: string;
  name: string;
  status: string;
  startDate: string;
  dueDate: string;
  notes: string;
  planDetail: string;
  type: "current" | "next";
}

export interface Project {
  id?: string;
  name: string;
  progress: number;
  status: string;
  tasks: Task[];
}

export interface IssueRisk {
  id?: string;
  issueDescription: string;
  mitigationPlan: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Report {
  id?: string;
  weekStart: string;
  weekEnd: string;
  user?: User;
  projects: Project[];
  issuesRisks: IssueRisk[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReportRequestType {
  weekStart: string;
  weekEnd: string;
  projects: Project[];
  issuesRisks: IssueRisk[];
}

export interface GetReportsRequestType {
  startDate?: string;
  endDate?: string;
  teamId?: string;
}

export interface ReportsResponseType {
  success: boolean;
  data?: Report[];
  message?: string;
}

export interface CreateReportResponseType {
  success: boolean;
  data?: Report;
  message?: string;
}