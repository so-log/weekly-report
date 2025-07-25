import { databaseClient } from "../../infrastructure/database/DatabaseClient";
import type {
  DatabaseTeam,
  DatabaseUser,
  DatabaseReport,
  DatabaseProject,
  DatabaseTask,
  DatabaseNotification,
  DatabaseNotificationSettings,
  DatabaseSystemNotificationSettings,
  ReportWithDetails,
} from "../../infrastructure/database/DatabaseTypes";

// Database Repository - Core Repository Layer
export const DatabaseRepository = {
  // 팀 관련
  teams: {
    async findAll(): Promise<DatabaseTeam[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT * FROM teams ORDER BY name");
        return result.rows;
      } finally {
        client.release();
      }
    },

    async findById(id: string): Promise<DatabaseTeam | null> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT * FROM teams WHERE id = $1", [
          id,
        ]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    },

    async findMembers(
      teamId: string
    ): Promise<(DatabaseUser & { team_role: string })[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT u.*, tm.role as team_role 
           FROM users u 
           JOIN team_members tm ON u.id = tm.user_id 
           WHERE tm.team_id = $1 
           ORDER BY u.name`,
          [teamId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },
  },

  // 사용자 관련
  users: {
    async findByEmail(email: string): Promise<DatabaseUser | null> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    },

    async create(
      userData: Omit<DatabaseUser, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseUser> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO users (email, name, password_hash, team_id, role) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [
            userData.email,
            userData.name,
            userData.password_hash,
            userData.team_id,
            userData.role,
          ]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async findById(id: string): Promise<DatabaseUser | null> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT * FROM users WHERE id = $1", [
          id,
        ]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    },

    async updateTeam(
      userId: string,
      teamId: string | null
    ): Promise<DatabaseUser> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          "UPDATE users SET team_id = $1 WHERE id = $2 RETURNING *",
          [teamId, userId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async findByTeam(teamId: string): Promise<DatabaseUser[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT * FROM users WHERE team_id = $1 ORDER BY name",
          [teamId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },

    async findAll(): Promise<DatabaseUser[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT * FROM users ORDER BY name");
        return result.rows;
      } finally {
        client.release();
      }
    },
  },

  // 보고서 관련
  reports: {
    async findByUserId(userId: string): Promise<ReportWithDetails[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        // 보고서 조회
        const reportsResult = await client.query(
          `SELECT * FROM reports WHERE user_id = $1 ORDER BY week_start DESC`,
          [userId]
        );

        const reports: ReportWithDetails[] = [];

        for (const report of reportsResult.rows) {
          // 프로젝트 조회
          const projectsResult = await client.query(
            `SELECT * FROM projects WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          const projects = [];
          for (const project of projectsResult.rows) {
            // 업무 조회
            const tasksResult = await client.query(
              `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at`,
              [project.id]
            );

            projects.push({
              ...project,
              tasks: tasksResult.rows,
            });
          }

          // 이슈 및 리스크 조회 (테이블이 존재하지 않을 수 있음)
          let issuesRisks = [];
          try {
            const issuesRisksResult = await client.query(
              `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
              [report.id]
            );
            issuesRisks = issuesRisksResult.rows;
          } catch (error) {
            console.log("issues_risks 테이블이 존재하지 않습니다:", error);
            issuesRisks = [];
          }

          reports.push({
            ...report,
            projects,
            issuesRisks,
          });
        }

        return reports;
      } finally {
        client.release();
      }
    },

    async findByTeamId(
      teamId: string
    ): Promise<(ReportWithDetails & { user: DatabaseUser })[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        // 팀 멤버들의 보고서 조회
        const reportsResult = await client.query(
          `SELECT r.*, u.name as user_name, u.email as user_email 
           FROM reports r 
           JOIN users u ON r.user_id = u.id 
           WHERE u.team_id = $1 
           ORDER BY r.week_start DESC, u.name`,
          [teamId]
        );

        const reports: (ReportWithDetails & { user: DatabaseUser })[] = [];

        for (const report of reportsResult.rows) {
          // 프로젝트 조회
          const projectsResult = await client.query(
            `SELECT * FROM projects WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          const projects = [];
          for (const project of projectsResult.rows) {
            // 업무 조회
            const tasksResult = await client.query(
              `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at`,
              [project.id]
            );

            projects.push({
              ...project,
              tasks: tasksResult.rows,
            });
          }

          // 이슈 및 리스크 조회 (테이블이 존재하지 않을 수 있음)
          let issuesRisks = [];
          try {
            const issuesRisksResult = await client.query(
              `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
              [report.id]
            );
            issuesRisks = issuesRisksResult.rows;
          } catch (error) {
            console.log("issues_risks 테이블이 존재하지 않습니다:", error);
            issuesRisks = [];
          }

          reports.push({
            ...report,
            projects,
            issuesRisks,
            user: {
              id: report.user_id,
              name: report.user_name,
              email: report.user_email,
              password_hash: "",
              team_id: teamId,
              role: "user",
              created_at: "",
              updated_at: "",
            },
          });
        }

        return reports;
      } finally {
        client.release();
      }
    },

    async findById(id: string): Promise<ReportWithDetails | null> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        // 보고서 조회
        const reportResult = await client.query(
          "SELECT * FROM reports WHERE id = $1",
          [id]
        );
        if (reportResult.rows.length === 0) return null;

        const report = reportResult.rows[0];

        // 프로젝트 조회
        const projectsResult = await client.query(
          `SELECT * FROM projects WHERE report_id = $1 ORDER BY created_at`,
          [report.id]
        );

        const projects = [];
        for (const project of projectsResult.rows) {
          // 업무 조회
          const tasksResult = await client.query(
            `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at`,
            [project.id]
          );

          projects.push({
            ...project,
            tasks: tasksResult.rows,
          });
        }

        // 이슈 및 리스크 조회 (테이블이 존재하지 않을 수 있음)
        let issuesRisks = [];
        try {
          const issuesRisksResult = await client.query(
            `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );
          issuesRisks = issuesRisksResult.rows;
        } catch (error) {
          console.log("issues_risks 테이블이 존재하지 않습니다:", error);
          issuesRisks = [];
        }

        return {
          ...report,
          projects,
          issuesRisks,
        };
      } finally {
        client.release();
      }
    },

    async create(
      reportData: Omit<DatabaseReport, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseReport> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO reports (user_id, week_start, week_end) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [reportData.user_id, reportData.week_start, reportData.week_end]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async update(
      id: string,
      reportData: Partial<DatabaseReport>
    ): Promise<DatabaseReport> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const fields = Object.keys(reportData).filter((key) => key !== "id");
        const values = fields.map(
          (field) => reportData[field as keyof DatabaseReport]
        );
        const setClause = fields
          .map((field, index) => `${field} = $${index + 2}`)
          .join(", ");

        const result = await client.query(
          `UPDATE reports SET ${setClause} WHERE id = $1 RETURNING *`,
          [id, ...values]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async delete(id: string): Promise<void> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        await client.query("DELETE FROM reports WHERE id = $1", [id]);
      } finally {
        client.release();
      }
    },

    async findByDateRange(
      userId: string,
      startDate: string,
      endDate: string
    ): Promise<ReportWithDetails[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const reportsResult = await client.query(
          `SELECT * FROM reports 
           WHERE user_id = $1 AND week_start >= $2 AND week_end <= $3 
           ORDER BY week_start DESC`,
          [userId, startDate, endDate]
        );

        const reports: ReportWithDetails[] = [];

        for (const report of reportsResult.rows) {
          // 프로젝트와 업무 조회
          const projectsResult = await client.query(
            `SELECT * FROM projects WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          const projects = [];
          for (const project of projectsResult.rows) {
            const tasksResult = await client.query(
              `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at`,
              [project.id]
            );

            projects.push({
              ...project,
              tasks: tasksResult.rows,
            });
          }

          // 이슈 및 리스크 조회
          const issuesRisksResult = await client.query(
            `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          reports.push({
            ...report,
            projects,
            issuesRisks: issuesRisksResult.rows,
          });
        }

        return reports;
      } finally {
        client.release();
      }
    },

    async findAllByDateRange(
      startDate: Date,
      endDate: Date
    ): Promise<DatabaseReport[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM reports 
           WHERE week_start >= $1 
           AND week_end <= $2 
           ORDER BY week_start DESC`,
          [startDate.toISOString(), endDate.toISOString()]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },
  },

  // 프로젝트 관련
  projects: {
    async create(
      projectData: Omit<DatabaseProject, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseProject> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO projects (report_id, name, progress, status) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [
            projectData.report_id,
            projectData.name,
            projectData.progress,
            projectData.status,
          ]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async update(
      id: string,
      projectData: Partial<DatabaseProject>
    ): Promise<DatabaseProject> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const fields = Object.keys(projectData).filter((key) => key !== "id");
        const values = fields.map(
          (field) => projectData[field as keyof DatabaseProject]
        );
        const setClause = fields
          .map((field, index) => `${field} = $${index + 2}`)
          .join(", ");

        const result = await client.query(
          `UPDATE projects SET ${setClause} WHERE id = $1 RETURNING *`,
          [id, ...values]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async delete(id: string): Promise<void> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        await client.query("DELETE FROM projects WHERE id = $1", [id]);
      } finally {
        client.release();
      }
    },
  },

  // 업무 관련
  tasks: {
    async create(
      taskData: Omit<DatabaseTask, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseTask> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO tasks (project_id, name, status, start_date, due_date, notes) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            taskData.project_id,
            taskData.name,
            taskData.status,
            taskData.start_date,
            taskData.due_date,
            taskData.notes,
          ]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async update(
      id: string,
      taskData: Partial<DatabaseTask>
    ): Promise<DatabaseTask> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const fields = Object.keys(taskData).filter((key) => key !== "id");
        const values = fields.map(
          (field) => taskData[field as keyof DatabaseTask]
        );
        const setClause = fields
          .map((field, index) => `${field} = $${index + 2}`)
          .join(", ");

        const result = await client.query(
          `UPDATE tasks SET ${setClause} WHERE id = $1 RETURNING *`,
          [id, ...values]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async delete(id: string): Promise<void> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        await client.query("DELETE FROM tasks WHERE id = $1", [id]);
      } finally {
        client.release();
      }
    },
  },

  // 알림 관련
  notifications: {
    async create(
      notificationData: Omit<
        DatabaseNotification,
        "id" | "created_at" | "updated_at"
      >
    ): Promise<DatabaseNotification> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO notifications (sender_id, recipient_id, title, message, type, sub_type) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING *`,
          [
            notificationData.sender_id,
            notificationData.recipient_id,
            notificationData.title,
            notificationData.message,
            notificationData.type,
            notificationData.sub_type,
          ]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },

    async findByRecipient(
      recipientId: string,
      limit: number = 50
    ): Promise<DatabaseNotification[]> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT * FROM notifications 
           WHERE recipient_id = $1 
           ORDER BY created_at DESC 
           LIMIT $2`,
          [recipientId, limit]
        );
        return result.rows;
      } finally {
        client.release();
      }
    },

    async markAsRead(notificationId: string): Promise<void> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        await client.query(
          "UPDATE notifications SET is_read = TRUE WHERE id = $1",
          [notificationId]
        );
      } finally {
        client.release();
      }
    },

    async delete(id: string): Promise<void> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        await client.query("DELETE FROM notifications WHERE id = $1", [id]);
      } finally {
        client.release();
      }
    },
  },

  // 알림 설정 관련
  notificationSettings: {
    async findByUserId(
      userId: string
    ): Promise<DatabaseNotificationSettings | null> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT * FROM notification_settings WHERE user_id = $1",
          [userId]
        );
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    },

    async createOrUpdate(
      settings: Omit<DatabaseNotificationSettings, "created_at" | "updated_at">
    ): Promise<DatabaseNotificationSettings> {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO notification_settings (user_id, email_notifications, browser_notifications, app_notifications, report_reminders, team_notifications) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (user_id) 
           DO UPDATE SET 
             email_notifications = EXCLUDED.email_notifications,
             browser_notifications = EXCLUDED.browser_notifications,
             app_notifications = EXCLUDED.app_notifications,
             report_reminders = EXCLUDED.report_reminders,
             team_notifications = EXCLUDED.team_notifications,
             updated_at = NOW()
           RETURNING *`,
          [
            settings.user_id,
            settings.email_notifications,
            settings.browser_notifications,
            settings.app_notifications,
            settings.report_reminders,
            settings.team_notifications,
          ]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    },
  },
};