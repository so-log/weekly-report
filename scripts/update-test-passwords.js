// 환경변수 로드
require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

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

async function updateTestPasswords() {
  try {
    console.log("🔐 Updating test user passwords...");

    // 테스트 비밀번호 (실제로 사용할 수 있는 비밀번호)
    const testPassword = "test123";
    const adminPassword = "admin123";

    // 비밀번호 해시
    const testPasswordHash = await bcrypt.hash(testPassword, 10);
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    // 테스트 사용자 비밀번호 업데이트
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      testPasswordHash,
      "test@example.com",
    ]);

    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      adminPasswordHash,
      "admin@example.com",
    ]);

    console.log("✅ Test passwords updated successfully!");
    console.log("📝 Test account credentials:");
    console.log("   Email: test@example.com");
    console.log("   Password: test123");
    console.log("   Email: admin@example.com");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Password update failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateTestPasswords();
