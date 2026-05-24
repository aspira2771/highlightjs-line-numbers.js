# 모바일 빌드 가이드

마이펫 다이어리는 [Capacitor](https://capacitorjs.com)로 iOS와 Android 네이티브 앱으로 패키징됩니다.

> 앱 식별자: `com.mypet.diary`
>
> 표시 이름: 마이펫 다이어리

## 사전 준비 (공통)

```bash
cd mypet-diary
npm install
npm run build          # dist/ 생성
npx cap sync           # 웹 자산을 android/ios 프로젝트로 복사
```

## Android

### 필요한 도구
- JDK 21
- Android Studio 또는 Android SDK + cmdline-tools
- Android SDK Platform 34, build-tools 34.0.0, platform-tools

### 디버그 APK 빌드
```bash
cd android
./gradlew assembleDebug
```
출력: `android/app/build/outputs/apk/debug/app-debug.apk`

### 실기기에 설치
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Android Studio에서 열기
```bash
npx cap open android
```

### 릴리스 APK
1. `android/app/build.gradle`에 signing config 추가
2. `keytool`로 keystore 생성
3. `./gradlew assembleRelease`

## iOS

### 필요한 도구 (macOS 전용)
- macOS (13+ 권장)
- Xcode 14.1 이상
- CocoaPods (`sudo gem install cocoapods`)

### 빌드
```bash
cd ios/App
pod install
open App.xcworkspace          # Xcode에서 열림
# Xcode → Product → Build (또는 Run on simulator)
```
또는:
```bash
npx cap open ios
```

### App Store 배포
1. Xcode → Signing & Capabilities에 Apple Developer Team 설정
2. Product → Archive → Distribute App → App Store Connect

> Linux/Windows에서는 iOS 네이티브 빌드가 불가합니다. 코드 수정과 `npx cap sync ios`까지는 가능하지만, 최종 빌드는 macOS에서 진행하세요.

## 변경 적용 흐름

웹 코드(`src/`)를 수정한 뒤:
```bash
npm run build && npx cap sync
```
그 후 Android/iOS 프로젝트를 다시 빌드합니다. (`./gradlew assembleDebug` 또는 Xcode Run)

## 알림

`@capacitor/local-notifications`를 통해 네이티브 알림이 작동합니다. 권한 요청은 앱 첫 실행 시 자동으로 진행되며, 마이펫 탭의 "설정"에서도 다시 요청할 수 있습니다.

## 검증 (개발 환경 Linux 기준)

이 저장소에서 이미 검증된 항목:
- `npm run build` 통과 (TypeScript 타입 체크 + Vite 프로덕션 빌드)
- `npx cap sync` 통과 (Android/iOS 자산 동기화)
- `./gradlew assembleDebug` 통과 (Android 디버그 APK 생성, 4.1MB)
- 헤드리스 Chromium에서 5개 탭 렌더링 확인 (Android WebView도 Chromium 기반)
- iOS Xcode 프로젝트 구조 유효 (Info.plist, AppDelegate, Podfile)

iOS 네이티브 빌드는 macOS에서만 가능하므로, 본 환경에서는 빌드 명령을 실행하지 않았습니다.
