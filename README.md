# crux-frontend

## Docker で実行する

### docker-compose を使う場合（推奨）

リポジトリルートで以下を実行します。
ECS

```bash
docker compose up --build
```

ブラウザで http://localhost:3000 にアクセスします。

**API について**: コンテナ内のアプリは `/api` リクエストをホスト側の **localhost:8000** にプロキシします。バックエンド API はホストでポート 8000 をリッスンしている状態で起動してください。

### Docker 単体で実行する場合

```bash
cd crux-app
docker build -t crux-frontend .
docker run -p 3000:80 --add-host=host.docker.internal:host-gateway crux-frontend
```

同様に http://localhost:3000 でアクセスできます。（`--add-host` はコンテナからホストの API へアクセスするために必要です。Linux では必須です。）
