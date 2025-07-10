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

async function createNotificationTables() {
  const client = await pool.connect();

  try {
    // 알림 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'manual',
        sub_type VARCHAR(50) NOT NULL DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 알림 설정 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        browser_notifications BOOLEAN DEFAULT TRUE,
        app_notifications BOOLEAN DEFAULT TRUE,
        report_reminders BOOLEAN DEFAULT TRUE,
        team_notifications BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 시스템 알림 설정 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_notification_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id VARCHAR(255) REFERENCES teams(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(team_id, day_of_week)
      );
    `);

    // 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      CREATE INDEX IF NOT EXISTS idx_system_notification_settings_team_id ON system_notification_settings(team_id);
      CREATE INDEX IF NOT EXISTS idx_system_notification_settings_day ON system_notification_settings(day_of_week);
    `);

    console.log("✅ 알림 테이블이 성공적으로 생성되었습니다!");
  } catch (error) {
    console.error("❌ 테이블 생성 중 오류가 발생했습니다:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

createNotificationTables();
