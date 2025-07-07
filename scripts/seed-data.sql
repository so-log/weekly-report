-- 테스트 사용자 데이터
INSERT INTO users (id, email, name, password_hash) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', '테스트 사용자', '$2b$10$dummy_hash_for_testing'),
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', '관리자', '$2b$10$dummy_hash_for_testing')
ON CONFLICT (email) DO NOTHING;

-- 테스트 보고서 데이터
INSERT INTO reports (id, user_id, week_start, week_end) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '2025-01-06', '2025-01-10'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2025-01-13', '2025-01-17')
ON CONFLICT (user_id, week_start) DO NOTHING;

-- 테스트 프로젝트 데이터
INSERT INTO projects (id, report_id, name, progress, status) VALUES 
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '웹사이트 리뉴얼', 75, 'on-track'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', '모바일 앱 개발', 45, 'at-risk'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'API 서버 구축', 90, 'on-track')
ON CONFLICT (id) DO NOTHING;

-- 테스트 업무 데이터
INSERT INTO tasks (project_id, name, status, start_date, due_date, notes) VALUES 
('770e8400-e29b-41d4-a716-446655440000', '메인 페이지 디자인', 'completed', '2025-01-06', '2025-01-08', '클라이언트 승인 완료'),
('770e8400-e29b-41d4-a716-446655440000', '반응형 구현', 'in-progress', '2025-01-09', '2025-01-10', '모바일 최적화 진행중'),
('770e8400-e29b-41d4-a716-446655440001', '사용자 인증', 'completed', '2025-01-06', '2025-01-07', 'JWT 토큰 방식 적용'),
('770e8400-e29b-41d4-a716-446655440001', '푸시 알림', 'delayed', '2025-01-08', '2025-01-09', '외부 서비스 연동 지연'),
('770e8400-e29b-41d4-a716-446655440002', 'DB 스키마 설계', 'completed', '2025-01-13', '2025-01-14', 'PostgreSQL 사용'),
('770e8400-e29b-41d4-a716-446655440002', 'API 엔드포인트 구현', 'in-progress', '2025-01-15', '2025-01-17', 'REST API 구현중');

-- 테스트 성과 데이터
INSERT INTO achievements (report_id, project, description, priority) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '웹사이트 리뉴얼', '메인 페이지 디자인 완료 및 클라이언트 승인 획득', 'high'),
('660e8400-e29b-41d4-a716-446655440000', '모바일 앱 개발', '사용자 인증 모듈 구현 완료', 'medium'),
('660e8400-e29b-41d4-a716-446655440001', 'API 서버 구축', 'DB 스키마 설계 완료 및 성능 최적화', 'high'),
('660e8400-e29b-41d4-a716-446655440001', 'API 서버 구축', 'API 문서화 및 테스트 케이스 작성', 'medium');
