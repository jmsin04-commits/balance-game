# 밸런스 게임

둘 중 하나를 고르면 다른 사람들의 선택 비율을 실시간으로 보여주는 웹 게임입니다.

- 화면: GitHub Pages (무료, 24시간, 노트북 꺼져도 동작)
- 투표 집계: Supabase (무료 DB)

## 파일

게임 전체(화면, 디자인, 질문, Supabase 설정, 동작 코드)가 `index.html` 한 파일에 들어 있습니다.

- 질문 수정: `index.html`에서 `window.BALANCE_QUESTIONS` 부분
- Supabase 주소/키: `index.html`에서 `window.BALANCE_CONFIG` 부분
- `supabase-setup.sql`: Supabase에 한 번 실행할 DB 설정 (사이트에는 필요 없음)

## 1. Supabase 설정 (투표 집계용, 한 번만)

1. https://supabase.com 가입 → **New project** 생성 (Region은 Seoul 추천)
2. 왼쪽 메뉴 **SQL Editor** → `supabase-setup.sql` 내용을 붙여넣고 **Run**
3. **Project Settings → API** 에서 두 값을 복사해 `index.html`의 `BALANCE_CONFIG`에 붙여넣기
   - Project URL → `SUPABASE_URL`
   - `anon` / `publishable` 키 → `SUPABASE_KEY`
   - ⚠️ `service_role` / `secret` 키는 절대 넣지 마세요

`BALANCE_CONFIG`가 비어 있으면 "데모 모드"로 동작합니다 (내 브라우저 안에서만 집계).

## 2. GitHub에 올리기

1. https://github.com/new 에서 새 저장소 생성 (예: `balance-game`, **Public**, README 추가하지 않기)
2. 이 폴더에서:

   ```bash
   git remote add origin https://github.com/<내아이디>/balance-game.git
   git push -u origin main
   ```

   비밀번호를 물으면 GitHub 비밀번호 대신 **Personal Access Token**을 입력합니다
   (GitHub → Settings → Developer settings → Personal access tokens).

## 3. GitHub Pages 켜기

저장소 → **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main` / `/ (root)` → **Save**

1~2분 뒤 `https://<내아이디>.github.io/balance-game/` 로 접속할 수 있습니다.

## 수정 후 다시 배포

```bash
git add .
git commit -m "질문 추가"
git push
```

push하면 1~2분 안에 사이트에 자동 반영됩니다.

## 로컬에서 미리 보기

```bash
python3 -m http.server 8000
```

→ 브라우저에서 http://localhost:8000

## 참고

- 같은 브라우저에서는 질문마다 한 번만 집계됩니다. 다시 플레이하면 예전에 고른 답과 현재 비율을 보여줍니다.
- 질문의 `id`는 집계 기준이라 바꾸면 안 됩니다. 새 질문은 새 `id`(0~999)로 추가하세요.
- 투표 수 초기화: Supabase SQL Editor에서 `truncate public.balance_votes;`
