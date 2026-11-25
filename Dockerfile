# ---------- 1단계: React 빌드 ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 2단계: nginx로 정적 파일 제공 (non-root, 8080) ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Jenkins가 --build-arg BUILD_TAG=빌드번호-커밋 으로 넘겨준다.
ARG BUILD_TAG=local
ENV BUILD_TAG=${BUILD_TAG} \
    APP_VERSION=v1

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
