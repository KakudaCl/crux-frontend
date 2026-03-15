# ビルドステージ
ARG NODE_IMAGE=public.ecr.aws/docker/library/node:22-alpine
ARG NGINX_IMAGE=public.ecr.aws/docker/library/nginx:alpine

FROM ${NODE_IMAGE} AS builder

WORKDIR /app

# 依存関係のインストール
COPY package.json package-lock.json ./
RUN npm ci

# ソースをコピーしてビルド
COPY . .
RUN npm run build

# 本番ステージ
FROM ${NGINX_IMAGE}

# ビルド成果物を nginx のドキュメントルートにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx 公式テンプレート機能を利用（起動時に envsubst で環境変数を展開）
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
