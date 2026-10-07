# 밸런스 게임

둘 중 하나를 고르고, 마지막에 내 선택을 모아서 보여주는 웹 게임입니다.
서버/DB 없이 정적 파일만으로 동작해서 GitHub Pages에 무료로 올릴 수 있습니다
(24시간, 노트북 꺼져도, 와이파이·LTE 어디서든 접속 가능).

## 파일

| 파일 | 내용 |
| --- | --- |
| `index.html`, `style.css`, `app.js` | 게임 화면 |
| `questions.js` | 질문 목록 — 여기만 고치면 질문 추가/수정 |

## 1. GitHub에 올리기

1. https://github.com/new 에서 새 저장소 생성 (예: `balance-game`, **Public**, README 추가하지 않기)
2. 이 폴더에서:

   ```bash
   git remote add origin https://github.com/<내아이디>/balance-game.git
   git push -u origin main
   ```

   비밀번호를 물으면 GitHub 비밀번호 대신 **Personal Access Token**을 입력합니다
   (GitHub → Settings → Developer settings → Personal access tokens).

## 2. GitHub Pages 켜기

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

- 질문 추가/수정은 `questions.js`만 고치면 됩니다.
