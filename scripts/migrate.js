// 환경변수 로드
require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST?.includes('rds.amazonaws.com') 
    ? { rejectUnauthorized: false }
    : false,
});

async function runMigrations() {
  try {
    console.log("🚀 Starting database migration...");

    // 마이그레이션 파일 읽기
    const migrationPath = path.join(__dirname, "create-tables.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // 마이그레이션 실행
    await pool.query(migrationSQL);

    console.log("✅ Database migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
