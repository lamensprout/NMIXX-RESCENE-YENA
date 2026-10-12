# Melonitor 계정 기능 설정

회원가입은 **이메일 인증 → 필수 닉네임 설정 → 이용** 순서입니다. Supabase 이메일 인증이 켜져 있어야 하며, 설정 전에는 계정 기능을 사용할 수 없습니다.

## 1. Supabase 프로젝트 만들기
1. Supabase에서 프로젝트를 만듭니다.
2. Project URL과 Publishable key를 확인합니다.
3. 프로젝트의 SQL Editor를 엽니다.

## 2. 데이터베이스 준비
1. 이 저장소의 `supabase-schema.sql`을 엽니다.
2. 전체 내용을 Supabase SQL Editor에 붙여 넣고 Run을 누릅니다.
3. 검색 기록, 즐겨찾기, 필수 닉네임 프로필 테이블과 사용자별 보안 정책이 만들어집니다.

기존에 이전 버전의 SQL을 실행했어도 업데이트된 파일을 다시 실행하면 새 닉네임 테이블과 정책이 추가됩니다.

## 3. 사이트에 프로젝트 연결
1. 이 저장소의 `supabase-config.js`를 엽니다.
2. `projectUrl`과 `publishableKey`에 각각 Supabase Project URL과 Publishable key를 입력합니다.
3. 변경 사항을 `web-app` 브랜치에 저장해 배포합니다.

브라우저에 보이는 공개용 Publishable key만 사용하세요. Secret key나 `service_role` key는 절대 넣지 마세요.

## 4. 이메일 인증을 반드시 켜기
1. Supabase Dashboard의 Authentication 설정에서 Email provider를 엽니다.
2. **Confirm email**이 켜져 있는지 확인합니다. 꺼져 있으면 회원가입 직후 세션이 발급되어 이메일 인증을 거치지 않을 수 있습니다.
3. Site URL을 `https://melonitor.pages.dev`로 설정합니다.
4. Redirect URLs 허용 목록에 `https://melonitor.pages.dev/account.html`을 추가합니다.

Supabase 공식 문서에 따르면 Confirm email이 켜져 있으면 회원가입 응답에서 세션이 즉시 발급되지 않고, 사용자는 이메일을 확인한 뒤 로그인할 수 있습니다. 설정이 꺼져 있어 세션이 즉시 발급되면 Melonitor는 안내 메시지를 표시합니다. 자세한 내용: https://supabase.com/docs/guides/auth/general-configuration

## 5. 가입 흐름 테스트
1. `/account.html`에서 이메일과 비밀번호를 입력하고 회원가입을 누릅니다.
2. 받은 편지함에서 인증 링크를 누릅니다.
3. 인증 링크가 Melonitor 계정 페이지로 돌아오면 닉네임 설정 폼이 나타납니다.
4. 한글 또는 영어로 2~16자 닉네임을 정합니다. 숫자와 밑줄도 허용됩니다. 공백과 다른 특수문자는 허용되지 않으며, 닉네임은 대소문자를 구분하지 않고 중복을 막습니다. 예를 들어 `NMIXX`, `nMIxx`, `NMixX`는 같은 닉네임으로 취급됩니다.
5. 닉네임 저장을 완료하면 메인 화면의 개인 검색어와 즐겨찾기를 이용할 수 있습니다.

## 기존 기록 이전
이메일 인증과 닉네임 설정을 완료한 뒤, 이 브라우저에 남아 있는 기존 검색 기록과 즐겨찾기를 계정으로 이전합니다. 브라우저에 더 이상 남아 있지 않은 기록이나 이전에 저장되지 않았던 서버 기록은 복구할 수 없습니다.
