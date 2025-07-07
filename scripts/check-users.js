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

async function checkUsers() {
  try {
    console.log("🔍 Checking users in database...");

    // 먼저 users 테이블의 스키마 확인
    const schemaResult = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    );

    console.log("📋 users 테이블 스키마:");
    schemaResult.rows.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    console.log("");

    // 존재하는 컬럼들만 조회
    const existingColumns = schemaResult.rows.map((col) => col.column_name);
    const selectColumns = existingColumns.join(", ");

    console.log(`조회할 컬럼: ${selectColumns}`);
    console.log("");

    // 모든 사용자 조회
    const result = await pool.query(
      `SELECT ${selectColumns} FROM users ORDER BY created_at`
    );

    console.log("📊 현재 데이터베이스 사용자 목록:");
    console.log("=".repeat(60));

    if (result.rows.length === 0) {
      console.log("❌ 데이터베이스에 사용자가 없습니다.");
      return;
    }

    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. 사용자 정보:`);
      Object.keys(user).forEach((key) => {
        console.log(`   ${key}: ${user[key] || "없음"}`);
      });
      console.log("");
    });

    console.log(`총 ${result.rows.length}명의 사용자가 있습니다.`);
  } catch (error) {
    console.error("❌ 사용자 조회 실패:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkUsers();
