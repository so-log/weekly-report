-- 팀 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블에 팀 정보와 역할 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager'));

-- 팀 멤버 테이블 (팀과 사용자의 관계)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('manager', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- updated_at 트리거 생성
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 팀 데이터 삽입
INSERT INTO teams (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '개발팀', '소프트웨어 개발 및 유지보수'),
    ('550e8400-e29b-41d4-a716-446655440002', '디자인팀', 'UI/UX 디자인 및 브랜딩'),
    ('550e8400-e29b-41d4-a716-446655440003', '기획팀', '제품 기획 및 전략 수립'),
    ('550e8400-e29b-41d4-a716-446655440004', '마케팅팀', '마케팅 및 홍보 활동')
ON CONFLICT DO NOTHING; 