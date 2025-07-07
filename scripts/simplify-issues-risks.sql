-- 단순화된 이슈 및 리스크 테이블 생성
CREATE TABLE IF NOT EXISTS issues_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    mitigation_plan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_issues_risks_report_id ON issues_risks(report_id);

-- updated_at 트리거 생성
CREATE TRIGGER update_issues_risks_updated_at BEFORE UPDATE ON issues_risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 