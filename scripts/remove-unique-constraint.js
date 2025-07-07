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

async function removeUniqueConstraint() {
  try {
    console.log("🔧 Removing unique constraint from reports table...");

    // 고유 제약조건 제거
    await pool.query(
      "ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_user_id_week_start_key"
    );

    console.log("✅ Unique constraint removed successfully!");
    console.log("📝 Users can now create multiple reports for the same week.");
  } catch (error) {
    console.error("❌ Failed to remove constraint:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

removeUniqueConstraint();
