# 마이펫 다이어리 (MyPet Diary)

> 내 반려동물이 직접 알려주는 감성형 펫 케어 다이어리

이 문서는 Claude Code가 본 프로젝트를 개발할 때 참조하는 작업 명세서다. 기획서 원문은 `/docs/spec.pdf`에 있으며, 본 문서는 개발에 필요한 핵심만 정리한 것이다.

-----

## 1. 프로젝트 개요

### 한 줄 소개

반려동물의 식사·약·영양제·산책·체중·병원 일정·특수동물 환경 관리를 한 번에 관리하고, 캐릭터 알림과 보상으로 꾸준한 돌봄 습관을 만드는 앱.

### 핵심 가치

- **기록** + **알림** + **감성** + **보상** + **건강 관리**를 하나로 연결
- 단순 기록 앱이 아니라, 보호자가 자주 열고 체크하고 보상받게 만드는 앱

### 차별화 포인트

1. 반려동물 사진 기반 **캐릭터화** + 듀오링고식 알림
1. **다종 반려동물** 지원 (강아지·고양이·파충류·소동물)
1. 루틴 관리 + **포인트 보상 시스템** 결합
1. AI 상담은 **진단 금지**, 병원 연결까지만

-----

## 2. 기술 스택 (제안)

|영역      |선택                                         |비고               |
|--------|-------------------------------------------|-----------------|
|Frontend|React + TypeScript + Vite                  |또는 Next.js       |
|스타일링    |Tailwind CSS                               |빠른 프로토타이핑        |
|상태관리    |Zustand 또는 React Context                   |초기엔 가벼운 것으로      |
|라우팅     |React Router                               |5개 탭 구조          |
|차트      |Recharts                                   |체중 변화 그래프        |
|날짜      |date-fns                                   |캘린더·반복 일정        |
|데이터 저장  |localStorage (MVP) → Firebase/Supabase (확장)|백엔드 단계적 도입       |
|아이콘     |lucide-react                               |                 |
|AI 상담   |Anthropic Claude API                       |`claude-sonnet-4`|


> 다른 스택을 원하면 사용자에게 확인 후 결정.

-----

## 3. 폴더 구조

```
mypet-diary/
├── src/
│   ├── components/
│   │   ├── common/           # Button, Modal, Input 등
│   │   ├── character/        # 캐릭터 모션·표정
│   │   ├── care/             # 케어 체크리스트
│   │   └── charts/           # 체중 그래프 등
│   ├── pages/
│   │   ├── Home.tsx          # 오늘의 케어 + 캐릭터
│   │   ├── Records.tsx       # 체중·식사·약·산책 기록
│   │   ├── Calendar.tsx      # 예방접종·병원 일정
│   │   ├── Community.tsx     # 내 동물 자랑 (MVP 후순위)
│   │   └── MyPet.tsx         # 반려동물 프로필 설정
│   ├── features/
│   │   ├── pet/              # 펫 등록·캐릭터 생성
│   │   ├── weight/           # 체중 관리
│   │   ├── meal/             # 사료 관리
│   │   ├── medication/       # 약 관리
│   │   ├── treat/            # 간식 관리
│   │   ├── supplement/       # 영양제 관리
│   │   ├── hospital/         # 병원·예방접종
│   │   ├── walk/             # 산책 관리
│   │   ├── reptile/          # 파충류 특화 (습도·탈피)
│   │   ├── points/           # 포인트·보상
│   │   └── ai-consult/       # AI 간단 상담
│   ├── hooks/
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript 타입
│   ├── utils/
│   └── App.tsx
├── public/
└── docs/
    └── spec.pdf              # 원본 기획서
```

-----

## 4. 데이터 모델

### Pet (반려동물)

```ts
type PetSpecies = 'dog' | 'cat' | 'reptile' | 'hamster' | 'rabbit' | 'other';

interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;       // ISO date
  adoptionDate?: string;
  gender?: 'male' | 'female';
  weight?: number;           // kg
  photoUrl: string;
  characterUrl?: string;     // 캐릭터화된 이미지
  notes?: string;            // 알레르기·질병·먹으면 안 되는 음식
  careTemplate: CareItemType[];  // 종별 자동 추천
  createdAt: string;
}
```

### CareItem (오늘의 케어 항목)

```ts
type CareItemType =
  | 'meal' | 'medication' | 'supplement' | 'treat'
  | 'walk' | 'weight' | 'vaccine' | 'hospital'
  | 'humidity' | 'temperature' | 'shedding'
  | 'uvb_lamp' | 'cage_cleaning' | 'bath' | 'grooming';

interface CareItem {
  id: string;
  petId: string;
  type: CareItemType;
  title: string;
  scheduledAt: string;       // ISO datetime
  completed: boolean;
  completedAt?: string;
  recurrence?: Recurrence;   // 반복 설정
  metadata?: Record<string, any>;  // type별 추가 정보
}

interface Recurrence {
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number;         // 3일에 1회 → interval: 3
  daysOfWeek?: number[];     // 0=일, 6=토
  endDate?: string;
}
```

### WeightRecord

```ts
interface WeightRecord {
  id: string;
  petId: string;
  weight: number;
  recordedAt: string;
  note?: string;
}
```

### Medication / Supplement

```ts
interface Medication {
  id: string;
  petId: string;
  name: string;
  dosage?: string;
  startDate: string;
  endDate?: string;
  recurrence: Recurrence;
  purpose?: string;          // 치료 목적
}

interface Supplement {
  id: string;
  petId: string;
  name: string;
  recurrence: Recurrence;
  remainingCount?: number;   // 잔량 추적
  alertThreshold?: number;   // 재구매 알림 기준
}
```

### HospitalRecord

```ts
interface HospitalRecord {
  id: string;
  petId: string;
  visitDate: string;
  hospitalName: string;
  hospitalContact?: string;
  purpose: string;           // 진료 목적
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  nextVisitDate?: string;
  attachments?: string[];    // 검사 결과 등
}
```

### WalkRecord

```ts
interface WalkRecord {
  id: string;
  petId: string;
  startedAt: string;
  durationMinutes: number;
  hadBowelMovement?: boolean;
  weather?: string;
  note?: string;
}
```

### ReptileEnvironment (파충류 환경)

```ts
interface ReptileEnvironment {
  id: string;
  petId: string;
  recordedAt: string;
  humidity?: number;          // %
  temperature?: number;       // ℃
  sheddingStatus?: 'normal' | 'abnormal' | 'in_progress';
  note?: string;
}
```

### Points (보상)

```ts
interface PointTransaction {
  id: string;
  amount: number;             // +/- 가능
  reason: string;             // '오늘의 케어 완료', '캐릭터 의상 구매' 등
  createdAt: string;
}

interface Streak {
  petId: string;
  currentDays: number;
  bestDays: number;
  lastCheckDate: string;
}
```

-----

## 5. 화면 구조 (IA)

### 하단 탭

|탭   |경로          |역할                |
|----|------------|------------------|
|홈   |`/`         |오늘의 케어, 캐릭터, 빠른 체크|
|기록  |`/records`  |체중·식사·약·산책·건강 기록  |
|캘린더 |`/calendar` |예방접종·병원·약·영양제 일정  |
|커뮤니티|`/community`|내 동물 자랑 (MVP 후순위) |
|마이펫 |`/mypet`    |반려동물 프로필·캐릭터·설정   |

### 핵심 사용자 흐름

**첫 사용**

```
앱 실행 → 반려동물 등록 → 사진 업로드 → 종 선택
→ 관리 항목 자동 추천 → 캐릭터 생성 → 알림 동의 → 홈 진입
```

**일상 사용**

```
위젯/푸시 알림 확인 → 앱 진입 → 오늘 할 케어 확인
→ 완료 체크 → 캐릭터 모션 → 포인트 적립 → (필요시) 상세 기록
```

**병원 방문 전**

```
기록 탭 → 최근 체중·식사·약·증상 확인
→ 병원 리포트 보기 → 방문 후 진료 기록 저장 → 다음 방문 일정 등록
```

-----

## 6. 종별 자동 추천 케어 템플릿

|종      |자동 추천 케어 항목                        |
|-------|-----------------------------------|
|강아지    |산책, 사료, 간식, 체중, 예방접종, 심장사상충, 목욕, 미용|
|고양이    |사료, 헤어볼 영양제, 체중, 예방접종, 병원 일정       |
|도마뱀/파충류|습도, 온도, 탈피, 먹이, UVB 램프 교체, 사육장 청소  |
|햄스터/소동물|사료, 사육장 청소, 체중                     |
|토끼     |사료, 청소, 발톱, 체중                     |

-----

## 7. 작업 단위 (Task Breakdown)

> 우선순위: **P1 = MVP 필수**, **P2 = 2차 확장**, **P3 = 3차 확장**

### P1: 프로젝트 셋업

- [ ] Vite + React + TypeScript 초기화
- [ ] Tailwind CSS, React Router, Zustand 설치
- [ ] 폴더 구조 생성 (위 트리 참조)
- [ ] 공통 컴포넌트 (Button, Input, Modal, BottomTab)
- [ ] 디자인 토큰 정의 (color, typography, spacing) - 감성형 톤

### P1: 반려동물 프로필 등록

- [ ] 펫 등록 폼 (이름·종·품종·생일·체중·사진·특이사항)
- [ ] 종별 자동 추천 케어 템플릿 적용
- [ ] localStorage 저장 (Zustand persist)
- [ ] 펫 목록·전환 UI (다종 지원)

### P1: 캐릭터화 (MVP 단계)

- [ ] 사진 업로드 + 기본 캐릭터 템플릿 선택 (3~5종)
- [ ] 캐릭터 표정 상태 (기쁨·아쉬움·안심·졸림)
- [ ] 홈 화면 중앙 배치

### P1: 오늘의 케어 체크리스트

- [ ] 홈 화면: 오늘 남은 케어 리스트
- [ ] 우선순위 분류 (긴급/일상/기록/환경)
- [ ] 체크 시 캐릭터 모션 (간단한 CSS 애니메이션)
- [ ] 연속 케어 일수 카운터

### P1: 사료·약·영양제·산책 기록

- [ ] 각 카테고리 등록/수정/삭제
- [ ] 반복 일정 설정 (하루 N회, N일에 1회, 요일별)
- [ ] 완료 체크
- [ ] 놓친 항목 표시

### P1: 체중 기록

- [ ] 날짜별 입력
- [ ] Recharts로 변화 그래프
- [ ] 급격한 증감 (2주 5% 이상) 시 확인 권유 메시지
  - 진단 표현 금지, "확인해보세요" 톤만

### P1: 병원·예방접종 일정

- [ ] 일정 등록 (날짜·목적·병원·연락처)
- [ ] 진료 기록 저장
- [ ] 캘린더 뷰
- [ ] 병원 리포트 (최근 체중/식사/약/증상 요약)

### P1: 푸시 알림 (웹 기준)

- [ ] Notification API 권한 요청
- [ ] 캐릭터 메시지 톤
  - "지현아, 콩이 밥 시간이야!"
  - "약 먹는 시간 놓치면 안 돼!"

-----

### P2: 포인트·보상 시스템

- [ ] 케어 완료 시 포인트 지급
- [ ] 연속 기록 보상 (3일·7일·30일)
- [ ] 포인트 사용처: 캐릭터 의상·배경·스티커
- [ ] 캐릭터 재생성권

### P2: 위젯 (PWA)

- [ ] PWA 매니페스트
- [ ] 홈 화면 단축아이콘
- [ ] 오프라인 모드

### P2: 회상 카드 / 추억 다이어리

- [ ] 입양일·생일·100일 기념 카드 자동 생성
- [ ] 어릴 때 사진 추천
- [ ] 체중·성장 비교 카드

### P2: 간식 관리

- [ ] 성분 메모
- [ ] 일/주 권장 횟수 설정
- [ ] 과다 급여 시 확인 알림

### P2: 이상 변화 메모

- [ ] 식욕·구토·설사·무기력·긁음·기침·탈피 이상·배변
- [ ] 병원 리포트에 자동 첨부

-----

### P3: AI 간단 상담

- [ ] Anthropic API 연동 (`claude-sonnet-4`)
- [ ] **안전 가드레일**:
  - 진단·처방 절대 금지
  - 위험 신호 감지 시 병원 방문 권유
  - 답변 톤: "정확한 진단은 동물병원에서 확인해야 해요. 다만 ~한 증상이 함께 있다면 가까운 병원에 문의하는 것이 좋아요."
- [ ] 주변 동물병원 찾기 (Geolocation + 지도 API)
- [ ] 저장된 병원 전화하기
- [ ] 상담 내용을 진료 기록에 저장하기

### P3: 커뮤니티

- [ ] 사진 게시·좋아요·댓글
- [ ] 종별 게시판
- [ ] 신고·금칙어·의료 조언 경고 문구
- [ ] **운영 정책 필요**: 분양글·과장 광고·잘못된 의료 조언 차단

### P3: 파충류·특수동물 특화

- [ ] 습도·온도 기록
- [ ] 탈피 상태 기록
- [ ] UVB 램프 교체 알림 (주기 설정)
- [ ] 사육장 청소 알림
- [ ] 3일 이상 환경 미입력 시 확인 알림

### P3: 가족 공유

- [ ] 가족 구성원 초대
- [ ] 누가 밥·약·산책을 담당했는지 기록
- [ ] 중복 급여 방지

### P3: 월간 케어 리포트

- [ ] 산책·약 복용 완료율
- [ ] 체중 변화
- [ ] 가장 꾸준히 한 케어
- [ ] PDF 내보내기 (병원 제출용)

-----

## 8. ⚠️ 개발 시 반드시 지킬 가드레일

|영역           |원칙                                                                   |
|-------------|---------------------------------------------------------------------|
|**의료 책임**    |AI 상담·체중 알림·증상 메모 어디서도 "진단" 표현 금지. "확인해보세요", "병원에 문의하는 것이 좋아요" 톤만 사용.|
|**알림 피로도**   |알림 종류를 **필수/일반/감성/회상/커뮤니티**로 분리, 사용자가 강도 선택 가능하게.                    |
|**기능 과다**    |MVP는 5개 축(등록·오늘의 케어·알림·기록·캐릭터 보상)만 집중.                               |
|**종별 정보 정확성**|종별 케어 항목은 보호자 기록 보조용. 수의학적 기준은 전문가 검토 영역으로 표시.                       |
|**커뮤니티 운영**  |의료 조언·분양글·과장 광고 차단 정책 필수.                                            |

-----

## 9. 디자인 톤

- **감성적이고 따뜻한 톤**: 파스텔, 둥근 모서리, 손글씨 느낌 일부 차용
- **캐릭터 중심**: 모든 주요 화면에 캐릭터가 등장
- **체크 완료 시 즉각적 반응**: 모션·사운드·포인트 셋 중 최소 하나
- **위젯·알림 메시지는 1인칭**: 캐릭터가 보호자에게 말 거는 형식

### 추천 컬러 팔레트 (예시)

```css
--primary: #FFB088;     /* 따뜻한 코랄 */
--secondary: #A8D8B9;   /* 민트 */
--accent: #F5D547;      /* 노랑 (포인트·보상) */
--bg: #FFF8F0;          /* 부드러운 베이지 */
--text: #3D3D3D;
```

-----

## 10. 다음 단계

Claude Code에게 작업을 시킬 때 권장 순서:

1. **`프로젝트 셋업`** → `npm create vite@latest mypet-diary -- --template react-ts`부터 시작
1. **`반려동물 프로필 등록 화면`** 부터 구현 (모든 기능의 기반)
1. **`홈 화면 + 오늘의 케어`** → 캐릭터·체크리스트 연결
1. **`체중·약·산책 기록`** → P1 나머지 채우기
1. **`MVP 데모 후`** P2 보상 시스템·회상 카드로 감성 강화
1. **`P3 AI 상담·커뮤니티`** → 안전 가드레일과 운영 정책 준비된 후 도입

### Claude Code에 처음 던질 프롬프트 예시

```
@CLAUDE.md를 읽고, 섹션 7의 "P1: 프로젝트 셋업"을 수행해줘.
Vite + React + TypeScript + Tailwind + React Router + Zustand로
초기 셋업하고, 섹션 3의 폴더 구조를 생성해줘.
공통 컴포넌트(Button, Input, Modal, BottomTab)와
섹션 9의 디자인 토큰을 Tailwind config에 반영해줘.
```

```
@CLAUDE.md 섹션 4의 데이터 모델을 `src/types/`에 TypeScript로 정의해줘.
이후 섹션 7의 "P1: 반려동물 프로필 등록"을 구현해줘.
종별 자동 추천 케어 템플릿(섹션 6)도 함께 적용해줘.
```
