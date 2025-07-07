-- achievements 테이블 마이그레이션 스크립트
-- 1. 기존 priority 컬럼 제거
-- 2. description 컬럼을 issue로 변경
-- 3. due_date 컬럼 추가

-- 기존 데이터 백업 (선택사항)
CREATE TABLE IF NOT EXISTS achievements_backup AS SELECT * FROM achievements;

-- achievements 테이블 수정
-- 1. priority 컬럼 제거
ALTER TABLE achievements DROP COLUMN IF EXISTS priority;

-- 2. description 컬럼을 issue로 변경
ALTER TABLE achievements RENAME COLUMN description TO issue;

-- 3. due_date 컬럼 추가
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS due_date DATE;

-- 4. 컬럼 제약 조건 업데이트
ALTER TABLE achievements ALTER COLUMN issue SET NOT NULL;

-- 인덱스 재생성 (필요한 경우)
DROP INDEX IF EXISTS idx_achievements_report_id;
CREATE INDEX idx_achievements_report_id ON achievements(report_id);

-- 트리거 재생성
DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
CREATE TRIGGER update_achievements_updated_at 
    BEFORE UPDATE ON achievements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 마이그레이션 완료 확인
SELECT 'Migration completed successfully' as status; 