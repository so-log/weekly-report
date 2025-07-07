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

async function deleteAllReports() {
  try {
    console.log("🗑️ Deleting all reports...");

    // 외래키 제약조건을 고려한 순서로 삭제
    await pool.query("DELETE FROM achievements");
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM projects");
    await pool.query("DELETE FROM reports");

    console.log("✅ All reports deleted successfully!");
    console.log("📝 You can now create new reports with correct dates.");
  } catch (error) {
    console.error("❌ Failed to delete reports:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

deleteAllReports();
