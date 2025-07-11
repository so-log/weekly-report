# 📊 Weekly Report System

주간 업무 보고서 관리 시스템입니다. 관리자와 사용자가 팀별로 주간 업무를 보고하고 관리할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 👥 사용자 관리

- **회원가입/로그인**: 이메일 기반 인증
- **역할 기반 접근**: 관리자(admin), 사용자(user), 매니저(manager)
- **팀 관리**: 팀별 사용자 그룹화
- **프로필 관리**: 개인 정보 및 설정 관리

### 📝 리포트 관리

- **주간 보고서 작성**: 프로젝트별 업무 진행상황 기록
- **프로젝트 관리**: 프로젝트별 진행률 및 상태 관리
- **업무 관리**: 세부 업무 항목 및 완료도 추적
- **이슈/리스크 관리**: 발생한 문제점과 대응 방안 기록

### 🔔 알림 시스템

- **수동 알림**: 관리자가 사용자에게 직접 알림 전송
- **자동 알림**: 팀별 설정된 요일에 자동 보고서 알림
- **알림 설정**: 사용자별 알림 수신 설정 관리

### 📊 관리자 기능

- **대시보드**: 전체 팀 및 사용자 현황 조회
- **사용자 관리**: 사용자 정보 수정, 삭제
- **팀별 리포트 조회**: 팀별 주간 보고서 현황
- **엑셀 다운로드**: 필터링된 보고서 데이터를 엑셀 파일로 다운로드
- **알림 설정**: 팀별 자동 알림 요일 설정

## 🏗️ 기술 스택

### Frontend

- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Radix UI**: 접근성 높은 UI 컴포넌트
- **Lucide React**: 아이콘 라이브러리
- **XLSX**: 엑셀 파일 생성 및 다운로드

### Backend

- **Next.js API Routes**: 서버리스 API
- **PostgreSQL**: 관계형 데이터베이스
- **bcrypt**: 비밀번호 해싱
- **JWT**: 토큰 기반 인증

### 개발 도구

- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **TypeScript**: 정적 타입 검사

## 📁 프로젝트 구조

```
weekly-report/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 admin/              # 관리자 페이지
│   │   │   ├── 📁 users/          # 사용자 관리
│   │   │   └── 📁 settings/       # 알림 설정
│   │   ├── 📁 api/                # API 엔드포인트
│   │   │   ├── 📁 auth/           # 인증 API
│   │   │   ├── 📁 reports/        # 리포트 API
│   │   │   ├── 📁 teams/          # 팀 API
│   │   │   ├── 📁 users/          # 사용자 API
│   │   │   └── 📁 notifications/  # 알림 API
│   │   ├── 📁 create/             # 리포트 작성
│   │   ├── 📁 edit/               # 리포트 수정
│   │   ├── 📁 profile/            # 프로필 페이지
│   │   └── 📁 reports/            # 리포트 목록
│   ├── 📁 components/             # React 컴포넌트
│   │   ├── 📁 ui/                 # 기본 UI 컴포넌트
│   │   ├── AdminDashboard.tsx     # 관리자 대시보드
│   │   ├── AuthPage.tsx           # 인증 페이지
│   │   ├── CreateReportPage.tsx   # 리포트 작성
│   │   ├── EditReportPage.tsx     # 리포트 수정
│   │   ├── NavigationHeader.tsx   # 네비게이션 헤더
│   │   ├── NotificationModal.tsx  # 알림 모달
│   │   ├── NotificationPopup.tsx  # 알림 팝업
│   │   ├── ProjectProgress.tsx    # 프로젝트 진행률
│   │   ├── TeamReportsTable.tsx   # 팀 리포트 테이블
│   │   └── WeeklyReportDashboard.tsx # 주간 리포트 대시보드
│   ├── 📁 hooks/                  # 커스텀 훅
│   │   ├── use-auth.ts           # 인증 훅
│   │   ├── use-reports.ts        # 리포트 훅
│   │   └── use-toast.ts          # 토스트 알림 훅
│   └── 📁 lib/                    # 유틸리티 라이브러리
│       ├── admin.ts              # 관리자 API
│       ├── api.ts                # API 클라이언트
│       ├── auth.ts               # 인증 유틸리티
│       ├── database.ts           # 데이터베이스 연결
│       └── utils.ts              # 공통 유틸리티
├── 📁 scripts/                    # 데이터베이스 스크립트
│   ├── 📁 SQL 파일들              # 테이블 구조 문서
│   ├── 📁 JS 파일들               # 실행 스크립트
│   └── README.md                 # 스크립트 사용법
├── 📁 public/                     # 정적 파일
├── package.json                   # 프로젝트 설정
├── tailwind.config.js            # Tailwind 설정
└── tsconfig.json                 # TypeScript 설정
```

## 🗄️ 데이터베이스 구조

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

- `notifications` - 알림 (최초 로그인 시 자동 팝업)
- `notification_settings` - 사용자별 설정
- `system_notification_settings` - 팀별 자동 알림

## 🚀 시작하기

### 1. 환경 설정

```bash
# 저장소 클론
git clone [repository-url]
cd weekly-report

# 의존성 설치
npm install
# 또는
yarn install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weekly_reports
DB_USER=your_username
DB_PASSWORD=your_password

# JWT 시크릿
JWT_SECRET=your_jwt_secret_key
```

### 3. 데이터베이스 설정

```bash
# 알림 테이블 생성
node scripts/create-notifications.js

# 테이블 구조 수정 (필요시)
node scripts/fix-notifications-table.js

# 초기 데이터 삽입
node scripts/seed.js
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

## 📋 사용법

### 👤 사용자

1. **회원가입**: 이메일과 비밀번호로 계정 생성
2. **로그인**: 인증 후 대시보드 접근
3. **리포트 작성**: 주간 업무 보고서 작성
4. **프로젝트 관리**: 업무 진행상황 기록
5. **알림 확인**: 관리자로부터 받은 알림 확인 (최초 로그인 시 자동 팝업)

### 👨‍💼 관리자

1. **대시보드**: 전체 현황 조회
2. **사용자 관리**: 사용자 정보 관리
3. **팀별 리포트**: 팀별 보고서 현황 확인
4. **엑셀 다운로드**: 필터링된 데이터를 엑셀 파일로 다운로드
5. **알림 전송**: 사용자에게 알림 전송
6. **알림 설정**: 팀별 자동 알림 설정

## 🔧 개발 가이드

### 새로운 기능 추가

1. **API 엔드포인트**: `src/app/api/`에 새 라우트 추가
2. **데이터베이스**: `src/lib/database.ts`에 함수 추가
3. **컴포넌트**: `src/components/`에 새 컴포넌트 생성
4. **타입 정의**: `src/lib/api.ts`에 타입 추가

### 알림 시스템

- **최초 로그인 알림**: 사용자가 로그인할 때마다 한 번씩만 알림 팝업 표시
- **알림 상태 관리**: localStorage를 통해 로그인 시간과 알림 체크 시간 추적
- **자동 팝업**: 관리자로부터 받은 읽지 않은 알림을 자동으로 표시

### 스타일 가이드

- **Tailwind CSS**: 유틸리티 클래스 사용
- **컴포넌트**: Radix UI 기반 접근성 고려
- **반응형**: 모바일 우선 디자인

## 📝 스크립트 사용법

### 데이터베이스 관리

```bash
# 알림 테이블 생성
node scripts/create-notifications.js

# 테이블 구조 수정 (필요시)
node scripts/fix-notifications-table.js

# SQL 파일 실행
node scripts/run-sql.js scripts/users-table.sql

# 초기 데이터 삽입
node scripts/seed.js
```

### 테이블 구조 확인

```bash
# 사용자 관리 테이블
cat scripts/users-table.sql

# 리포트 관리 테이블
cat scripts/reports-table.sql

# 알림 시스템 테이블
cat scripts/notifications-table.sql
```
