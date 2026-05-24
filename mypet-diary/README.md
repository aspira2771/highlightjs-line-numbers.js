# 마이펫 다이어리 (MyPet Diary)

> 반려동물의 식사·약·영양제·산책·체중·병원 일정을 한 곳에서 관리하는 감성형 펫 케어 다이어리. 자세한 명세는 [`CLAUDE.md`](./CLAUDE.md)에 있습니다.

## 빠른 시작

```bash
cd mypet-diary
npm install
npm run dev
```

브라우저에서 표시되는 주소(보통 `http://localhost:5173`)로 접속해 사용해보세요.

## 빌드

```bash
npm run build      # 타입 체크 + 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
```

## 기술 스택

- React 18 + TypeScript + Vite
- Tailwind CSS (감성 톤 디자인 토큰 적용)
- React Router (5개 탭 구조)
- Zustand + persist (localStorage 자동 저장)
- Recharts (체중 변화 그래프)
- date-fns, lucide-react

## 폴더 구조 (요약)

```
mypet-diary/
├── src/
│   ├── components/     # 공통·캐릭터·케어·차트 컴포넌트
│   ├── features/       # 펫·체중·식사·약·영양제·산책·병원 폼
│   ├── pages/          # Home / Records / Calendar / Community / MyPet
│   ├── stores/         # Zustand 스토어 (pet·care·records·points)
│   ├── hooks/          # useNotification, useCareReminder
│   ├── types/          # 데이터 모델 (Pet, CareItem, WeightRecord 등)
│   └── utils/          # date, id, careLabels, cn
├── CLAUDE.md           # 작업 명세서 (원본 기획서 요약)
└── tailwind.config.js
```

## 구현된 기능 (P1)

- 반려동물 프로필 등록 / 수정 / 삭제 / 다중 펫 전환
- 종별 자동 케어 템플릿 추천 (강아지·고양이·파충류·햄스터·토끼)
- 사진 + 캐릭터 템플릿 5종 + 캐릭터 무드(기쁨·아쉬움·안심·졸림)
- 오늘의 케어 체크리스트 (긴급/일상/기록/환경 분류)
- 체크 시 캐릭터 모션 + 포인트 적립 + 연속 케어 일수
- 체중 기록 + Recharts 그래프 + 2주 5% 변동 알림 (진단 표현 없음)
- 식사·산책·약·영양제 기록
- 병원 진료 기록 + 캘린더 + 다음 방문일
- 푸시 알림 (Notification API) 권한 요청 및 케어 시간 알림
- 의료 가드레일: "확인해보세요", "병원에 문의하는 것이 좋아요" 톤 유지

## 디자인 토큰

`tailwind.config.js`에 정의:

- `primary` (#FFB088) 따뜻한 코랄
- `secondary` (#A8D8B9) 민트
- `accent` (#F5D547) 노랑 (포인트·보상)
- `bg` (#FFF8F0) 부드러운 베이지
- `ink` (#3D3D3D) 본문 텍스트

손글씨 느낌은 `font-hand` (Gaegu) 클래스로 사용합니다.

## 데이터

모든 데이터는 브라우저의 `localStorage`에 저장됩니다. (`mypet:pets`, `mypet:care`, `mypet:records`, `mypet:points`)

추후 확장 단계에서 Firebase 또는 Supabase 연동을 검토할 수 있습니다.

## 라이선스

내부 개발용. 외부 배포 전에는 가드레일(섹션 8)을 다시 점검하세요.
