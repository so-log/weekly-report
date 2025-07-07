import { Pool, type PoolClient } from "pg";

// AWS RDS PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 연결 테스트
pool.on("connect", () => {
  console.log("Connected to AWS RDS PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// 데이터베이스 타입 정의
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

// 조인된 데이터 타입
export interface ReportWithDetails extends DatabaseReport {
  projects: (DatabaseProject & {
    tasks: DatabaseTask[];
  })[];
}

// 데이터베이스 헬퍼 함수들
export const db = {
  // 연결 풀 가져오기
  getPool: () => pool,

  // 트랜잭션 실행
  async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // 팀 관련
  teams: {
    async findAll(): Promise<DatabaseTeam[]> {
      const client = await pool.connect();
      try {
        const result = await client.query("SELECT * FROM teams ORDER BY name");
        return result.rows;
      } finally {
        client.release();
      }
    },

    async findById(id: string): Promise<DatabaseTeam | null> {
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
  },

  // 보고서 관련
  reports: {
    async findByUserId(userId: string): Promise<ReportWithDetails[]> {
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

    async findByTeamId(
      teamId: string
    ): Promise<(ReportWithDetails & { user: DatabaseUser })[]> {
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

          // 이슈 및 리스크 조회
          const issuesRisksResult = await client.query(
            `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          reports.push({
            ...report,
            projects,
            issuesRisks: issuesRisksResult.rows,
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

        // 이슈 및 리스크 조회
        const issuesRisksResult = await client.query(
          `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
          [report.id]
        );

        return {
          ...report,
          projects,
          issuesRisks: issuesRisksResult.rows,
        };
      } finally {
        client.release();
      }
    },

    async create(
      reportData: Omit<DatabaseReport, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseReport> {
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
  },

  // 프로젝트 관련
  projects: {
    async create(
      projectData: Omit<DatabaseProject, "id" | "created_at" | "updated_at">
    ): Promise<DatabaseProject> {
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
      const client = await pool.connect();
      try {
        await client.query("DELETE FROM tasks WHERE id = $1", [id]);
      } finally {
        client.release();
      }
    },
  },
};

// 연결 종료 함수 (앱 종료 시 사용)
export const closeDatabase = async () => {
  await pool.end();
};

// 프로세스 종료 시 연결 정리
process.on("SIGINT", closeDatabase);
process.on("SIGTERM", closeDatabase);
