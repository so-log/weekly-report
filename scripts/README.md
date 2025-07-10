# Database Scripts

이 폴더는 데이터베이스 관련 스크립트들을 포함합니다.

## 📁 파일 구조

### 🗂️ 테이블 구조 문서 (SQL)

- `users-table.sql` - 사용자 관리 테이블 구조
- `reports-table.sql` - 리포트 관리 테이블 구조
- `notifications-table.sql` - 알림 시스템 테이블 구조

### 🔧 실행 스크립트 (JS)

- `create-notifications.js` - 알림 테이블 생성
- `run-sql.js` - SQL 파일 실행 도구
- `migrate.js` - 데이터베이스 마이그레이션
- `seed.js` - 초기 데이터 삽입

### 📋 기존 테이블 (SQL)

- `create-tables.sql` - 기본 테이블 생성
- `add-team-system.sql` - 팀 시스템 추가
- `add-issues-risks.sql` - 이슈/리스크 테이블 추가
- `seed-data.sql` - 초기 데이터

## 🚀 사용법

### 테이블 생성

```bash
# 알림 테이블 생성
node scripts/create-notifications.js

# SQL 파일 실행
node scripts/run-sql.js scripts/users-table.sql
```

### 테이블 구조 확인

```bash
# 사용자 관리 테이블 구조
cat scripts/users-table.sql

# 리포트 관리 테이블 구조
cat scripts/reports-table.sql

# 알림 시스템 테이블 구조
cat scripts/notifications-table.sql
```

## 📊 데이터베이스 구조

### 사용자 관리

- `users` - 사용자 정보
- `teams` - 팀 정보
- `team_members` - 팀-사용자 관계

### 리포트 관리

- `reports` - 주간 리포트
- `projects` - 프로젝트
- `tasks` - 업무
- `issues_risks` - 이슈/리스크

### 알림 시스템

- `notifications` - 알림
- `notification_settings` - 사용자별 설정
- `system_notification_settings` - 팀별 자동 알림

## 🔄 마이그레이션

데이터베이스 구조 변경 시:

1. SQL 파일로 변경사항 문서화
2. JS 스크립트로 실행 자동화
3. `migrate.js`로 변경사항 적용
