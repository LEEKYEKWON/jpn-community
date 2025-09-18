# 日本人妻のコミュニティ (일본인 아내 커뮤니티)

한국에 거주하는 일본인 아내들을 위한 커뮤니티 웹사이트입니다.

## 🌸 주요 기능

- **지도 기반 회원 소개**: 네이버 지도 API를 활용한 회원 위치 표시
- **게시판 시스템**: 4개 카테고리별 게시판 (만남, 한국 생활 정보, 중고거래, 자유게시판)
- **회원 인증**: React Context 기반 인증 시스템
- **반응형 디자인**: 모바일/데스크톱 최적화
- **일본 감성 UI**: 파스텔톤의 따뜻한 디자인

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Map**: 네이버 지도 API
- **Authentication**: React Context + bcryptjs
- **Styling**: TailwindCSS

## 📋 사전 요구사항

- Node.js 18.0 이상
- PostgreSQL 데이터베이스
- 네이버 지도 API 키

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd jpn
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jpn_community?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Naver Map API
NEXT_PUBLIC_NAVER_CLIENT_ID="your-naver-client-id"
NEXT_PUBLIC_NAVER_CLIENT_SECRET="your-naver-client-secret"

# App Configuration
NEXT_PUBLIC_APP_NAME="日本人妻のコミュニティ"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. 데이터베이스 설정
```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# Prisma 클라이언트 생성
npx prisma generate

# 테스트 데이터 생성 (선택사항)
npm run db:seed
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

## 🧪 테스트 데이터

### 시드 데이터 생성
개발 및 테스트를 위한 샘플 데이터를 생성할 수 있습니다:

```bash
# 테스트 데이터 생성
npm run db:seed

# 데이터베이스 초기화 후 테스트 데이터 생성
npm run db:reset
```

### 테스트 계정
시드 데이터 생성 후 다음 계정으로 로그인할 수 있습니다:

**관리자 계정:**
- 이메일: `admin@jpn.com`
- 비밀번호: `123456`

**일반 사용자 계정:**
- `yuki@jpn.com` - 서울 강남구 거주
- `sakura@jpn.com` - 서울 서초구 거주  
- `mai@jpn.com` - 부산 해운대구 거주
- `hiroko@jpn.com` - 대구 중구 거주
- `ayame@jpn.com` - 인천 연수구 거주
- 모든 계정 비밀번호: `123456`

생성되는 데이터:
- 👥 6명의 사용자 (관리자 1명 + 일반 사용자 5명)
- 📍 모든 사용자는 자기소개와 위치 정보 등록 완료
- 📝 각 게시판별 3개씩 총 12개의 샘플 게시글
- 💬 게시글당 1-4개의 댓글

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/          # 인증 관련 API
│   │   ├── posts/         # 게시글 API
│   │   └── users/         # 사용자 API
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   ├── meet/              # 만남 게시판
│   ├── korea-info/        # 한국 생활 정보 게시판
│   ├── market/            # 중고거래 게시판
│   ├── board/             # 자유게시판
│   └── admin/             # 관리자 페이지
├── components/            # React 컴포넌트
│   ├── Navigation.tsx     # 네비게이션
│   └── NaverMap.tsx       # 네이버 지도 컴포넌트
├── contexts/              # React Context
│   └── AuthContext.tsx    # 인증 컨텍스트
└── lib/                   # 유틸리티 함수
    ├── prisma.ts          # Prisma 클라이언트
    └── auth.ts            # 인증 관련 함수
```

## 🗄️ 데이터베이스 스키마

### User (사용자)
- id: 고유 식별자
- email: 이메일 (고유)
- name: 이름
- password: 암호화된 비밀번호
- bio: 자기소개
- latitude/longitude: 위치 정보
- address: 주소
- isAdmin: 관리자 여부
- isApproved: 승인 여부

### Post (게시글)
- id: 고유 식별자
- title: 제목
- content: 내용
- category: 카테고리
- authorId: 작성자 ID
- viewCount: 조회수
- likeCount: 좋아요 수
- isPinned: 고정 여부

### Comment (댓글)
- id: 고유 식별자
- content: 내용
- postId: 게시글 ID
- authorId: 작성자 ID
- parentId: 대댓글용 부모 댓글 ID

### Report (신고)
- id: 고유 식별자
- type: 신고 유형 (post, comment, user)
- targetId: 신고 대상 ID
- reason: 신고 사유
- reporterId: 신고자 ID

## 🎨 디자인 시스템

### 색상 팔레트
- Primary: Pink (#ec4899, #be185d)
- Background: Pink-50 (#fdf2f8)
- Text: Gray-900 (#111827)
- Border: Gray-200 (#e5e7eb)

### 컴포넌트 스타일
- 카드: `bg-white rounded-lg shadow-lg`
- 버튼: `bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md`
- 입력: `border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500`

## 🔧 주요 기능 설명

### 1. 지도 기반 회원 소개
- 네이버 지도 API를 사용한 위치 표시
- 커스텀 마커 (원형, 색상 변경 가능)
- 지도-리스트 연동 (클릭 시 스크롤/포커스)
- 위치 선택 모드 (회원가입 시)

### 2. 게시판 시스템
- 4개 카테고리별 분리
- 검색 기능 (제목, 내용)
- 페이지네이션
- 조회수, 댓글수, 좋아요수 표시

### 3. 인증 시스템
- React Context 기반 상태 관리
- bcryptjs를 사용한 비밀번호 암호화
- 회원가입/로그인/로그아웃
- 위치 정보 업데이트

## 🚀 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경변수 설정
3. PostgreSQL 데이터베이스 연결 (Neon, Supabase 등)
4. 자동 배포 완료

### 환경변수 설정 (배포 시)
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
NEXT_PUBLIC_NAVER_CLIENT_ID="your-naver-client-id"
NEXT_PUBLIC_NAVER_CLIENT_SECRET="your-naver-client-secret"
NEXT_PUBLIC_APP_NAME="日本人妻のコミュニティ"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## 📝 개발 가이드

### 새로운 게시판 추가
1. `src/app/[category]/page.tsx` 생성
2. `src/app/api/posts/route.ts`에 카테고리 추가
3. `src/components/Navigation.tsx`에 메뉴 추가

### 새로운 API 엔드포인트 추가
1. `src/app/api/[endpoint]/route.ts` 생성
2. HTTP 메서드별 함수 구현
3. Prisma를 사용한 데이터베이스 조작

### 스타일 수정
- TailwindCSS 클래스 사용
- `src/app/globals.css`에서 전역 스타일 수정
- 컴포넌트별 스타일은 해당 파일에서 수정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**日本人妻のコミュニティ** - 한국에 거주하는 일본인 아내들을 위한 따뜻한 커뮤니티 🌸