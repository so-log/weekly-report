-- 성과(achievements) 테이블, 인덱스, 트리거 삭제 마이그레이션

-- 트리거 먼저 삭제
DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;

-- 인덱스 삭제
DROP INDEX IF EXISTS idx_achievements_report_id;

-- 테이블 삭제
DROP TABLE IF EXISTS achievements; 