# ビルドステージ
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm ci

# ソースをコピーしてビルド
COPY . .
RUN npm run build

# 本番ステージ
FROM public.ecr.aws/docker/library/nginx:alpine

# ビルド成果物を nginx のドキュメントルートにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# カスタム nginx 設定をコピー（SPA 用ルーティング対応）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
