# 使用 Node.js 官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装生产依赖（跳过 devDependencies）
RUN npm ci --omit=dev

# 复制所有源代码
COPY . .

# 构建项目（如果使用了 TypeScript 需要编译）
RUN npm run build

# 暴露应用端口（与 NestJS 的端口一致）
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "start"]