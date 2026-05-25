# 배포 가이드 & 설정 체크리스트

이 문서는 **마이펫 다이어리**를 실제 서비스로 띄우기 위해 필요한 단계를 정리합니다.
코드 쪽은 준비돼 있고, 아래 ✅ 항목들은 **계정/키가 필요해 사용자가 직접** 해야 합니다.

---

## 1. 백엔드 + 로그인 (Supabase)

1. ✅ https://supabase.com 에서 프로젝트 생성
2. SQL 편집기에서 `supabase/schema.sql` 실행 (테이블 + RLS 생성)
3. **Authentication → Providers** 에서 소셜 로그인 켜기:
   - **Google**: Google Cloud Console에서 OAuth 클라이언트(웹) 생성 →
     Client ID/Secret 을 Supabase에 입력.
     - 승인된 리디렉션 URI: `https://<프로젝트>.supabase.co/auth/v1/callback`
   - **Kakao**: https://developers.kakao.com 앱 생성 → REST API 키/Client Secret →
     Supabase Kakao provider에 입력. Redirect URI도 위와 동일하게 등록.
4. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키 복사 →
   `mypet-diary/.env` 에 입력:
   ```
   VITE_SUPABASE_URL=https://<프로젝트>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
5. dev 서버 재시작 → 로그인 화면의 **카카오/Google 버튼이 실제로 동작**합니다.
   (키가 없으면 자동으로 "게스트 모드"로 동작)

> 현재 데이터는 브라우저(localStorage)에 저장됩니다. Supabase 연결 후 클라우드
> 동기화로 전환하는 작업은 다음 단계(아래 4번)입니다.

---

## 2. AI 캐릭터 — 프로덕션 프록시

개발 중에는 `vite.character-proxy.ts`(dev 서버 전용)가 OpenAI를 대신 호출합니다.
배포 빌드/앱에서는 동작하지 않으므로 **호스팅형 서버리스 함수**로 옮겨야 합니다.

- 권장: Supabase **Edge Function** (`supabase functions new generate-character`)
  또는 Vercel/Netlify Function. 키(`OPENAI_API_KEY`)는 그 플랫폼 환경변수에만 둡니다.
- 프론트는 `src/features/pet/generateCharacter.ts` 의 fetch URL만 그 함수 주소로 바꾸면 됩니다.
- 자세한 배경은 `AI_CHARACTER.md` 참고.

---

## 3. iOS 배포 (Capacitor)

1. ✅ **Apple Developer Program** 가입 ($99/년) — 앱스토어 배포에 필수
2. Xcode 라이선스 동의: `sudo xcodebuild -license accept`
3. 웹 자산 동기화 후 Xcode 열기:
   ```bash
   cd mypet-diary
   npm run build && npx cap sync ios
   npx cap open ios
   ```
4. Xcode에서: Signing & Capabilities → 본인 Team 선택, Bundle ID 확인
   (`com.mypet.diary`)
5. 위치/카메라 권한 설명 문구를 `Info.plist`에 추가:
   - `NSLocationWhenInUseUsageDescription` — 산책 경로 기록용
   - `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription` — 반려동물 사진
6. 실기기 테스트 → Archive → App Store Connect 업로드

> 백그라운드 위치 추적이 필요하면 `@capacitor/geolocation` + background 권한을 추가해야
> 합니다. 현재 산책 추적은 앱이 화면에 떠 있을 때 동작합니다.

---

## 4. 다음 단계 (코드 작업, 계정 불필요)

- [ ] Zustand 스토어 ↔ Supabase 동기화 레이어 (로그인 시 클라우드, 게스트는 로컬)
- [ ] 번들 코드 스플리팅 (지도/차트/Supabase 지연 로딩으로 초기 로딩 단축)
- [ ] PWA 매니페스트 (P2 백로그)
- [ ] 부족한 기능 채우기: 간식 관리, 이상 증상 메모, 월간 리포트 등 (CLAUDE.md §7 P2/P3)
