# 第一阶段: 构建阶段
FROM node:20-alpine as builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY .env .ent.* ./
COPY . .
RUN pnpm run build

# 第二阶段: 生产阶段
FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app

# 从构建阶段复制必要文件
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json ./
COPY .env .ent.* ./

# 只安装生产依赖
RUN pnpm prune --prod

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]