const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// 환경변수 로드
require("dotenv").config({ path: ".env.local" });

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

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // 시드 파일 읽기
    const seedPath = path.join(__dirname, "seed-data.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf8");

    // 시드 데이터 실행
    await pool.query(seedSQL);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
