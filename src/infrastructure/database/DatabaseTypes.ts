// Database Types - Infrastructure Layer

export interface DatabaseTeam {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  team_id: string | null;
  role: "admin" | "user" | "manager";
  created_at: string;
  updated_at: string;
}

export interface DatabaseTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "manager" | "member";
  joined_at: string;
}

export interface DatabaseReport {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProject {
  id: string;
  report_id: string;
  name: string;
  progress: number;
  status: "on-track" | "at-risk" | "delayed";
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask {
  id: string;
  project_id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed" | "delayed";
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNotification {
  id: string;
  sender_id: string | null;
  recipient_id: string;
  title: string;
  message: string;
  type: "manual" | "system";
  sub_type: "report_request" | "announcement" | "report_reminder";
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNotificationSettings {
  user_id: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  app_notifications: boolean;
  report_reminders: boolean;
  team_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSystemNotificationSettings {
  id: string;
  team_id: string;
  day_of_week: number; // 0=일요일, 1=월요일, ..., 6=토요일
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 조인된 데이터 타입
export interface ReportWithDetails extends DatabaseReport {
  projects: (DatabaseProject & {
    tasks: DatabaseTask[];
  })[];
}