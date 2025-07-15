const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

// 데이터베이스 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  ssl: { rejectUnauthorized: false },
});

async function runSqlFile(filePath) {
  const client = await pool.connect();

  try {
    // SQL 파일 읽기
    const sqlContent = fs.readFileSync(filePath, "utf8");

    await client.query(sqlContent);
  } catch (error) {
    console.error("오류 상세:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// 명령행 인수에서 파일 경로 가져오기
const sqlFile = process.argv[2];

if (!sqlFile) {
  process.exit(1);
}

const filePath = path.resolve(sqlFile);

if (!fs.existsSync(filePath)) {
  process.exit(1);
}

runSqlFile(filePath);
