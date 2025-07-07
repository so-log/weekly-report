-- achievements 테이블에 다음주 계획용 컬럼 추가
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS issue TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS due_date DATE; 