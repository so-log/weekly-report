# 📊 Weekly Report System

주간 업무 보고서 관리 시스템입니다. **Clean Architecture + MVVM 패턴**을 적용하여 유지보수성과 확장성을 극대화한 웹 애플리케이션입니다.

## 🏗️ 아키텍처 특징

### 🎯 Clean Architecture + MVVM 패턴
- **관심사 분리**: 비즈니스 로직과 UI 로직의 완전한 분리
- **의존성 역전**: 인터페이스 기반 의존성 관리
- **테스트 용이성**: 각 계층별 독립적인 테스트 가능
- **확장성**: 새로운 기능 추가 시 기존 코드 영향 최소화

### 📁 프로젝트 구조

```
📁 src/
├── 📁 app/              # Next.js 라우팅 (views/view/ import만)
│   ├── 📁 admin/        # 관리자 라우팅
│   ├── 📁 api/          # API 엔드포인트
│   ├── 📁 auth/         # 인증 라우팅
│   ├── 📁 create/       # 리포트 작성 라우팅
│   ├── 📁 edit/         # 리포트 수정 라우팅
│   └── 📁 profile/      # 프로필 라우팅
│
├── 📁 core/             # 도메인 비즈니스 로직 (Clean Architecture)
│   ├── 📁 domain/       # 도메인 서비스
│   │   ├── LoginDomain.ts
│   │   ├── RegisterDomain.ts
│   │   ├── ReportDomain.ts
│   │   └── UserDomain.ts
│   ├── 📁 entity/       # 엔티티 & 타입 정의
│   │   ├── ApiTypes.ts  # 공통 도메인 타입
│   │   ├── LoginTypes.ts
│   │   ├── ReportTypes.ts
│   │   └── UserTypes.ts
│   ├── 📁 repository/   # 데이터 액세스 계층
│   │   ├── LoginApi.ts (인터페이스)
│   │   ├── LoginApiImpl.ts (구현체)
│   │   ├── ReportApi.ts
│   │   ├── ReportApiImpl.ts
│   │   ├── AuthApiImpl.ts
│   │   ├── ReportsApiImpl.ts
│   │   ├── AdminApiImpl.ts
│   │   └── DatabaseRepository.ts
│   ├── 📁 usecase/      # 유스케이스 (비즈니스 규칙)
│   │   ├── LoginUseCase.ts
│   │   ├── ReportUseCase.ts
│   │   └── UserUseCase.ts
│   └── 📁 utils/        # 공통 유틸리티
│       └── ClassUtils.ts
│
├── 📁 infrastructure/   # 인프라스트럭처 계층 (외부 시스템 연동)
│   ├── 📁 api/          # HTTP 클라이언트
│   │   └── ApiClient.ts # API 클라이언트, 재시도 로직, 에러 처리
│   └── 📁 database/     # 데이터베이스 연결
│       ├── DatabaseClient.ts # PostgreSQL 연결 관리
│       └── DatabaseTypes.ts  # DB 스키마 타입
│
└── 📁 views/            # MVVM 패턴 UI 계층
    ├── 📁 component/    # 재사용 UI 컴포넌트 (Model/Component)
    │   ├── 📁 ui/       # 기본 UI 컴포넌트
    │   ├── AdminDashboard.tsx
    │   ├── CreateReportPage.tsx
    │   ├── NavigationHeader.tsx
    │   └── NotificationModal.tsx
    ├── 📁 view/         # 페이지 레벨 뷰 (View)
    │   ├── admin.tsx
    │   ├── auth.tsx
    │   ├── create.tsx
    │   ├── home.tsx
    │   └── profile.tsx
    ├── 📁 provider/     # Context 프로바이더
    │   └── AuthProvider.tsx
    └── 📁 viewModel/    # 비즈니스 로직 (ViewModel)
        ├── AuthViewModel.ts
        ├── CreateReportViewModel.ts
        ├── LoginViewModel.ts
        └── ReportListViewModel.ts
```

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

## 🛠️ 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크 (App Router)
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Radix UI**: 접근성 높은 UI 컴포넌트
- **Lucide React**: 아이콘 라이브러리
- **XLSX**: 엑셀 파일 생성 및 다운로드

### Backend
- **Next.js API Routes**: 서버리스 API
- **PostgreSQL**: 관계형 데이터베이스 (AWS RDS)
- **bcrypt**: 비밀번호 해싱
- **JWT**: 토큰 기반 인증

### Infrastructure
- **PostgreSQL Connection Pool**: 데이터베이스 연결 관리
- **HTTP Client**: 재시도 로직 및 에러 핸들링
- **Transaction Management**: 데이터 일관성 보장

### 아키텍처 패턴
- **Clean Architecture**: 계층별 관심사 분리
- **MVVM Pattern**: Model-View-ViewModel 패턴 적용
- **Repository Pattern**: 데이터 액세스 추상화
- **Dependency Injection**: 의존성 주입을 통한 결합도 감소

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

## 📋 아키텍처 가이드

### 🏛️ Clean Architecture 계층

1. **Entity Layer** (`core/entity/`)
   - 비즈니스 엔티티와 타입 정의
   - 외부 의존성 없는 순수 비즈니스 모델

2. **Use Case Layer** (`core/usecase/`)
   - 애플리케이션 비즈니스 규칙
   - 엔티티를 조작하는 애플리케이션별 규칙

3. **Repository Layer** (`core/repository/`)
   - 데이터 액세스 추상화
   - 인터페이스와 구현체 분리

4. **Domain Layer** (`core/domain/`)
   - 도메인 서비스 및 복잡한 비즈니스 로직

5. **Infrastructure Layer** (`infrastructure/`)
   - 외부 시스템과의 연동 (Database, API, File System)
   - 기술적 구현 세부사항 처리
   - Core 계층이 의존하는 인터페이스의 구현체

### 🎯 MVVM 패턴

1. **Model** (`views/component/` + `core/entity/`)
   - 데이터와 비즈니스 로직
   - UI와 독립적인 비즈니스 모델

2. **View** (`views/view/`)
   - 사용자 인터페이스
   - ViewModel에서 데이터를 받아 표시

3. **ViewModel** (`views/viewModel/`)
   - View와 Model 사이의 바인딩
   - UI 로직과 상태 관리

### 🔄 데이터 흐름

```
View → ViewModel → Domain → UseCase → Repository → Infrastructure
                                                         ↓
                                                   API/Database
```

1. **View**: 사용자 상호작용
2. **ViewModel**: 상태 관리 및 비즈니스 로직 호출
3. **Domain**: 복잡한 비즈니스 규칙 처리
4. **UseCase**: 애플리케이션 시나리오 실행
5. **Repository**: 데이터 소스 추상화
6. **Infrastructure**: 외부 시스템 연동 (API, Database)

### 🔗 의존성 방향

```
Infrastructure → Core ← Views
     ⬆️           ⬆️      ⬆️
   (구현)      (규칙)   (표시)
```

- **Core**: 비즈니스 규칙, 외부 시스템과 무관
- **Infrastructure**: Core의 인터페이스를 구현
- **Views**: Core의 UseCase를 호출하여 UI 표시

## 🔧 개발 가이드

### 새로운 기능 추가 절차

1. **Entity 정의**: `core/entity/`에 타입 정의
2. **Repository 인터페이스**: `core/repository/`에 인터페이스 추가
3. **Repository 구현체**: Infrastructure에서 API 호출 로직 구현
4. **UseCase 생성**: 비즈니스 규칙 정의
5. **Domain 서비스**: 복잡한 로직 처리
6. **ViewModel 생성**: UI 상태 관리
7. **View 구현**: 사용자 인터페이스 구현
8. **라우팅 연결**: `app/` 폴더에 라우팅 추가

### 코딩 컨벤션

- **파일명**: PascalCase (컴포넌트), camelCase (함수)
- **인터페이스**: `I` 접두어 사용 (예: `ILoginApi`)
- **구현체**: `Impl` 접미어 사용 (예: `LoginApiImpl`)
- **타입**: `Type` 접미어 사용 (예: `LoginRequestType`)

### Import 규칙

```typescript
// ✅ 올바른 Import 경로
import { User } from "../../core/entity/ApiTypes";
import { AuthApiImpl } from "../../core/repository/AuthApiImpl";
import { apiClient } from "../../infrastructure/api/ApiClient";
import { DatabaseRepository } from "../../core/repository/DatabaseRepository";
import { cn } from "../../core/utils/ClassUtils";

// ❌ 잘못된 Import (lib 폴더는 제거됨)
import { User } from "../../lib/api"; // 더 이상 존재하지 않음
```

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

## 🎯 설계 원칙

1. **단일 책임 원칙**: 각 클래스는 하나의 책임만 가짐
2. **개방-폐쇄 원칙**: 확장에는 열려있고 변경에는 닫혀있음
3. **의존성 역전 원칙**: 추상화에 의존하고 구체화에 의존하지 않음
4. **관심사 분리**: 비즈니스 로직과 UI 로직의 분리
5. **테스트 가능성**: 각 계층별 독립적인 테스트 가능

## 🏗️ 주요 아키텍처 개선사항

### Infrastructure 계층 분리
- **AS-IS**: `lib/` 폴더에 모든 유틸리티 혼재
- **TO-BE**: `infrastructure/` 계층으로 외부 시스템 연동 분리
- **효과**: 비즈니스 로직과 기술적 구현의 완전한 분리

### Repository 패턴 개선
- **DatabaseRepository**: 모든 DB 접근 로직 중앙화
- **API 구현체들**: 각 도메인별 API 클라이언트 분리
- **재시도 및 에러 처리**: Infrastructure 계층에서 일관성 있게 처리

### 타입 시스템 개선
- **ApiTypes.ts**: 공통 도메인 타입 중앙 관리
- **DatabaseTypes.ts**: DB 스키마 타입 분리
- **Import 경로**: 클린 아키텍처 원칙에 따른 경로 정리

이 아키텍처를 통해 **유지보수성**, **확장성**, **테스트 용이성**을 극대화하였습니다.