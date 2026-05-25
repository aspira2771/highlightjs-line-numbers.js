# AI 2D 캐릭터 생성

펫 사진을 OpenAI 이미지 모델(`gpt-image-1`)로 귀여운 2D 캐릭터로 변환하는 기능입니다.

## 동작 구조

```
브라우저(PetForm)  ──POST /api/generate-character──►  서버 프록시  ──►  OpenAI
   사진 data URL                                  (OPENAI_API_KEY)      gpt-image-1 edits
        ◄──────────────── 생성된 캐릭터 data URL ◄──────────────────────────
```

**키는 절대 브라우저로 나가지 않습니다.** 서버(프록시)에서만 `OPENAI_API_KEY`를 읽어 사용합니다.

## 로컬 개발 설정

```bash
cd mypet-diary
cp .env.example .env          # .env 는 gitignore 됨
# .env 안의 OPENAI_API_KEY 를 본인 키로 채우기
npm run dev                   # 키를 바꿨으면 서버 재시작 필요
```

마이펫 탭 → 반려동물 등록/수정 → **사진 업로드** 후 **`✨ AI 캐릭터 만들기`** 버튼을 누르면
생성된 캐릭터가 미리보기에 표시되고, 저장하면 홈·마이펫·펫 전환 등 모든 화면에 적용됩니다.
**원본 사진 사용** 링크로 언제든 되돌릴 수 있어요.

`OPENAI_API_KEY` 가 없으면 버튼은 친절한 안내 메시지를 띄우고 앱은 정상 동작합니다.

## 프로덕션 (중요)

`vite.character-proxy.ts` 의 프록시는 **개발 서버에서만** 동작합니다. 빌드된 웹/Capacitor 앱에서
쓰려면 동일한 로직을 호스팅형 서버리스 함수(Vercel/Netlify/Cloudflare)로 옮기고,
키를 그 플랫폼의 환경변수에 두세요. 클라이언트 앱은 절대 키를 가지면 안 됩니다.
