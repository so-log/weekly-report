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

async function checkUserReports() {
  try {
    console.log("🔍 Checking user reports...");

    // 테스트 사용자의 보고서 조회
    const result = await pool.query(
      "SELECT * FROM reports WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY week_start"
    );

    console.log("📊 User reports:");
    result.rows.forEach((report, index) => {
      console.log(`${index + 1}. ID: ${report.id}`);
      console.log(`   Week Start: ${report.week_start}`);
      console.log(`   Week End: ${report.week_end}`);
      console.log(`   Created: ${report.created_at}`);
      console.log("");
    });

    if (result.rows.length === 0) {
      console.log("No reports found for this user.");
    }
  } catch (error) {
    console.error("❌ Failed to check reports:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkUserReports();
