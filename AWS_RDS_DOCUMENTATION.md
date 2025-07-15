# AWS RDS (Relational Database Service) 문서

## 📊 현재 프로젝트에서 AWS RDS가 하는 일

### 1. 데이터베이스 역할
- **주간 보고서 데이터 저장**: 사용자들이 작성한 주간 업무 보고서
- **사용자 관리**: 로그인/회원가입 정보, 팀 관리
- **알림 시스템**: 시스템 알림 및 사용자 알림 데이터
- **팀 및 권한 관리**: 관리자/일반 사용자 권한, 팀별 데이터 분리

### 2. 데이터베이스 구성
```
📍 RDS 인스턴스: weekly-report-db.cmc3rgjdifni.eu-north-1.rds.amazonaws.com
🗄️ 데이터베이스: PostgreSQL 16.9
🌍 리전: eu-north-1 (스톡홀름)
🔐 연결 방식: SSL 필수
```

### 3. 주요 테이블 구조
- **users**: 사용자 정보 (ID, 이름, 이메일, 비밀번호, 역할)
- **teams**: 팀 정보 
- **reports**: 주간 보고서 데이터
- **notifications**: 알림 관리
- **기타**: 프로젝트 진행률, 이슈/리스크 등

## 🚀 AWS RDS를 사용하는 이유

### 1. **관리 부담 감소**
```
❌ 로컬 DB: 직접 설치, 업데이트, 백업, 보안 패치
✅ AWS RDS: AWS가 자동으로 관리
```

### 2. **확장성**
- **수직 확장**: CPU, 메모리 증설 쉬움
- **수평 확장**: 읽기 전용 복제본(Read Replica) 생성 가능
- **스토리지**: 자동 확장 가능

### 3. **가용성 및 안정성**
- **Multi-AZ 배포**: 자동 장애 조치
- **자동 백업**: 최대 35일까지
- **Point-in-time 복구**: 특정 시점으로 복구 가능

### 4. **보안**
- **VPC**: 네트워크 격리
- **암호화**: 전송 중/저장 시 암호화
- **IAM 통합**: AWS IAM으로 접근 제어
- **보안 그룹**: 방화벽 규칙

### 5. **모니터링**
- **CloudWatch**: 성능 지표 모니터링
- **Performance Insights**: 쿼리 성능 분석
- **Enhanced Monitoring**: 실시간 메트릭

## 💰 비용 최적화

### 현재 설정
```
인스턴스 유형: db.t3.micro (프리 티어)
스토리지: 20GB SSD
백업: 7일 보관
Multi-AZ: 비활성화 (개발용)
```

### 프리 티어 혜택
- **750시간/월**: db.t3.micro 인스턴스
- **20GB**: 범용 SSD 스토리지
- **20GB**: 백업 스토리지

## ⚙️ 프로젝트 설정

### 환경 변수 (.env.local)
```bash
# AWS RDS 연결 정보
DB_HOST=weekly-report-db.cmc3rgjdifni.eu-north-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=weekly-report-db
DB_USER=postgres
DB_PASSWORD=qwe123qwe123!

# 연결 문자열
POSTGRES_URL_NON_POOLING="postgres://postgres:qwe123qwe123!@weekly-report-db.cmc3rgjdifni.eu-north-1.rds.amazonaws.com:5432/weekly-report-db"
POSTGRES_URL="postgres://postgres:qwe123qwe123!@weekly-report-db.cmc3rgjdifni.eu-north-1.rds.amazonaws.com:5432/weekly-report-db?pgbouncer=true&connection_limit=1"
```

### SSL 설정
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST?.includes('rds.amazonaws.com') 
    ? { rejectUnauthorized: false }
    : false,
});
```

## 🔄 마이그레이션 및 관리

### 스크립트 명령어
```bash
# 테이블 생성
npm run db:migrate

# 초기 데이터 입력
npm run db:seed

# SQL 파일 실행
npm run db:run-sql <파일경로>
```

### 백업 전략
1. **자동 백업**: AWS RDS 자동 백업 (7일)
2. **수동 스냅샷**: 중요한 변경 전 수동 생성
3. **로컬 백업**: `pg_dump`로 개발용 백업

## 🔍 모니터링 및 최적화

### 성능 모니터링
- **CloudWatch 메트릭**: CPU, 메모리, 연결 수
- **슬로우 쿼리 로그**: 성능 문제 쿼리 식별
- **Connection pooling**: pgbouncer 사용

### 보안 체크리스트
- [x] SSL/TLS 연결 강제
- [x] 강력한 비밀번호 사용
- [ ] IAM 데이터베이스 인증 (선택사항)
- [ ] 보안 그룹 최소 권한 원칙
- [ ] VPC 내 배치 (프로덕션 시)

## 📈 향후 개선 사항

### 프로덕션 환경
1. **Multi-AZ 배포**: 고가용성
2. **Read Replica**: 읽기 성능 향상
3. **VPC 배치**: 네트워크 보안
4. **암호화**: 저장 시 암호화 활성화
5. **IAM 인증**: 비밀번호 대신 IAM 역할 사용

### 성능 최적화
1. **인덱스 최적화**: 쿼리 성능 향상
2. **Connection pooling**: 연결 효율성
3. **캐싱**: Redis/ElastiCache 도입
4. **파티셔닝**: 대용량 데이터 처리

## 🚨 주의사항

### 비용 관리
- 프리 티어 한도 초과 시 과금
- 스토리지 자동 확장 설정 확인
- 백업 보관 기간 조정

### 보안
- `.env.local` 파일 Git 커밋 금지
- 정기적인 비밀번호 변경
- 접근 로그 모니터링

### 백업
- 중요한 변경 전 스냅샷 생성
- 정기적인 복구 테스트
- 로컬 개발 환경 데이터 동기화

---

**✅ 현재 상태**: AWS RDS PostgreSQL 16.9 인스턴스 생성 완료, 모든 테이블 마이그레이션 완료
**🔗 연결 상태**: 정상 연결, SSL 암호화 적용
**💾 데이터**: 빈 데이터베이스 (시드 데이터 필요시 `npm run db:seed` 실행)