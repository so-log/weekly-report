const { Pool } = require("pg");
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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function fixNotificationsTable() {
  const client = await pool.connect();

  try {
    // 현재 테이블 구조 확인
    console.log("🔍 현재 notifications 테이블 구조 확인 중...");
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `);

    console.log(
      "현재 컬럼들:",
      tableInfo.rows.map((row) => row.column_name)
    );

    // sub_type 컬럼이 있는지 확인
    const hasSubType = tableInfo.rows.some(
      (row) => row.column_name === "sub_type"
    );

    if (!hasSubType) {
      console.log("➕ sub_type 컬럼 추가 중...");
      await client.query(`
        ALTER TABLE notifications 
        ADD COLUMN sub_type VARCHAR(50) NOT NULL DEFAULT 'general';
      `);
      console.log("✅ sub_type 컬럼이 성공적으로 추가되었습니다!");
    } else {
      console.log("ℹ️ sub_type 컬럼이 이미 존재합니다.");
    }

    // 최종 테이블 구조 확인
    console.log("\n📋 최종 notifications 테이블 구조:");
    const finalTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `);

    finalTableInfo.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${
          row.is_nullable === "YES" ? "NULL" : "NOT NULL"
        } ${row.column_default ? `DEFAULT ${row.column_default}` : ""}`
      );
    });
  } catch (error) {
    console.error("❌ 테이블 수정 중 오류가 발생했습니다:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixNotificationsTable();
