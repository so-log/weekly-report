-- 알림 시스템 테이블 구조
-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'system'
    sub_type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'report_request', 'announcement', 'report_reminder'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 알림 설정 테이블 (사용자별 알림 설정)
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

-- 시스템 알림 설정 테이블 (팀별 자동 알림 설정)
CREATE TABLE IF NOT EXISTS system_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(255) REFERENCES teams(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=일요일, 1=월요일, ..., 6=토요일
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, day_of_week)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_system_notification_settings_team_id ON system_notification_settings(team_id);
CREATE INDEX IF NOT EXISTS idx_system_notification_settings_day ON system_notification_settings(day_of_week);

-- updated_at 트리거 생성
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_notification_settings_updated_at BEFORE UPDATE ON system_notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 