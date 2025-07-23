import { Pool, type PoolClient } from "pg";

// AWS RDS PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 연결 테스트
pool.on("connect", () => {
  console.log("Connected to AWS RDS PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Database Infrastructure Layer
export const databaseClient = {
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
};

// 연결 종료 함수 (앱 종료 시 사용)
export const closeDatabase = async () => {
  await pool.end();
};

// 프로세스 종료 시 연결 정리
process.on("SIGINT", closeDatabase);
process.on("SIGTERM", closeDatabase);