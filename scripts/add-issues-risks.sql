-- 이슈 및 리스크 테이블 생성
CREATE TABLE IF NOT EXISTS issues_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('issue', 'risk')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
    mitigation_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_issues_risks_report_id ON issues_risks(report_id);
CREATE INDEX IF NOT EXISTS idx_issues_risks_type ON issues_risks(type);
CREATE INDEX IF NOT EXISTS idx_issues_risks_severity ON issues_risks(severity);
CREATE INDEX IF NOT EXISTS idx_issues_risks_status ON issues_risks(status);

-- updated_at 트리거 생성
CREATE TRIGGER update_issues_risks_updated_at BEFORE UPDATE ON issues_risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 