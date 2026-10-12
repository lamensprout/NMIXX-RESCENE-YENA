# Melonitor 계정 기능 설정

회원가입 흐름은 **이메일 입력 및 6자리 인증 코드 발송 → 코드 확인 → 닉네임과 비밀번호 설정 → 이용**입니다. 로그인은 기존 회원이 이메일과 비밀번호를 입력하는 방식만 사용합니다.

## 1. Supabase 프로젝트 연결
1. Supabase에서 프로젝트를 만듭니다.
2. Project URL과 Publishable key를 확인합니다.
3. 저장소의 \`supabase-config.js\`에 두 값을 입력합니다. 브라우저용 공개 Publishable key만 사용하고 Secret/service_role key는 절대 입력하지 않습니다.

## 2. 데이터베이스 스키마 실행
1. 이 저장소의 \`supabase-schema.sql\`을 엽니다.
2. 전체 내용을 Supabase SQL Editor에 붙여 넣고 Run을 누릅니다.
3. 검색 기록, 즐겨찾기, 닉네임 고유성, 부적절한 닉네임 필터 테이블과 정책이 준비됩니다.

## 3. 이메일 인증 설정
1. Supabase Dashboard → Authentication → Sign In / Providers → Email에서 **Confirm email**을 켭니다.
2. Authentication → URL Configuration에서 Site URL을 `https://melonitor.pages.dev`로 설정하고 Redirect URLs에 `https://melonitor.pages.dev/account.html`을 추가합니다.
3. Authentication → Email Templates → **Confirm signup** 템플릿을 열고 subject와 body를 6자리 코드 방식으로 바꿉니다.

Subject:
`[Melonitor] 이메일 인증 코드: {{ .Token }}`

Body (HTML):
`<h2>Melonitor 이메일 인증</h2><p>회원가입을 완료하려면 아래 6자리 인증 코드를 Melonitor 페이지에 입력해 주세요.</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;">{{ .Token }}</p><p>본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p>`

4. Save를 누릅니다. 가입 때 보내는 이메일은 **Confirm signup** 템플릿을 사용하므로, **Magic link** 템플릿만 바꾸는 것으로는 충분하지 않습니다.

Supabase 공식 문서:
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/reference/javascript/auth-verifyotp

## 4. 가입 테스트
1. `/account.html`에서 이메일 주소를 입력하고 **인증 코드 보내기**를 누릅니다.
2. 이메일에 도착한 6자리 숫자를 사이트에 입력하고 **인증 코드 확인**을 누릅니다.
3. 인증 후 닉네임과 비밀번호 설정 화면이 나타납니다.
4. 닉네임을 정하고 앞으로 로그인에 사용할 비밀번호(8~72자)를 입력합니다.
5. 완료 후에는 이메일과 비밀번호만으로 로그인할 수 있습니다.

이미 인증한 이메일은 가입용 코드가 다시 발송되지 않을 수 있습니다. 첫 테스트 후 다른 이메일로 새 가입을 시험하거나, 기존 테스트 계정으로는 로그인해 주세요. 이메일 발송은 Supabase의 이메일 제공자/SMTP 및 발송 제한 설정의 영향을 받습니다.

## 기존 기록
이메일 인증 및 닉네임 설정을 마친 뒤 이 브라우저에 남아 있는 검색 기록과 즐겨찾기를 계정으로 이전합니다. 이미 사라진 기록은 복구할 수 없습니다.

## 닉네임 기준
한글/영문 2~16자, 숫자와 밑줄 허용. 영문 대소문자에 관계없이 중복을 차단합니다. 욕설·성적 표현·혐오 표현, 개인정보로 보이는 닉네임, 운영진 사칭은 제한합니다. 숫자나 밑줄을 끼워 넣은 일부 우회 표기도 정규화해 검사하지만, 모든 문맥을 완벽하게 판별할 수는 없습니다.
