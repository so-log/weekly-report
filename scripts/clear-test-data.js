// 환경변수 로드
require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

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
});

async function clearTestData() {
  try {
    console.log("🗑️ Clearing test data...");

    // 외래키 제약조건을 고려한 순서로 삭제
    await pool.query("DELETE FROM achievements");
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM projects");
    await pool.query("DELETE FROM reports");

    // 테스트 사용자는 유지 (로그인용)

    console.log("✅ Test data cleared successfully!");
    console.log("📝 You can now create new reports with current dates.");
  } catch (error) {
    console.error("❌ Failed to clear test data:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearTestData();
