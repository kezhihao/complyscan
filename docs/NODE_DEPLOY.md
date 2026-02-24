# ComplyScan 部署指南（标准 Node.js 版本）

## 概述

ComplyScan 现在支持标准 Node.js 部署，无需 Cloudflare 账户。可以部署到：
- **Vercel** - 推荐，免费额度充足
- **Railway** - 简单，支持数据库
- **Render** - 稳定，有持久存储
- **Fly.io** - 全球部署
- **任何 VPS** - 完全控制

---

## 方法 1: Vercel 部署（推荐）

### 步骤 1: 安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2: 登录 Vercel

```bash
vercel login
```

### 步骤 3: 部署

```bash
cd projects/complyscan
vercel --prod
```

### 步骤 4: 配置环境变量（可选）

在 Vercel Dashboard 中设置：
- `DATABASE_PATH` - SQLite 数据库路径（可选，默认内存）
- `STORAGE_TYPE` - 存储类型：`memory` 或 `local`
- `GITHUB_CLIENT_ID` - GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth Client Secret

### 步骤 5: 验证部署

```bash
curl https://your-app.vercel.app/
```

预期响应：
```json
{"status":"healthy","service":"complyscan-api","version":"0.1.0","timestamp":"..."}
```

---

## 方法 2: Railway 部署

### 步骤 1: 安装 Railway CLI

```bash
npm install -g @railway/cli
```

### 步骤 2: 登录

```bash
railway login
```

### 步骤 3: 初始化项目

```bash
cd projects/complyscan
railway init
```

### 步骤 4: 添加 PostgreSQL（可选）

```bash
railway add postgresql
```

### 步骤 5: 部署

```bash
railway up
```

### 步骤 6: 获取 URL

```bash
railway domain
```

---

## 方法 3: Docker 部署

### 步骤 1: 创建 Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 步骤 2: 构建镜像

```bash
docker build -t complyscan .
```

### 步骤 3: 运行容器

```bash
docker run -p 3000:3000 complyscan
```

### 步骤 4: 测试

```bash
curl http://localhost:3000/
```

---

## 方法 4: 本地运行（开发）

### 步骤 1: 安装依赖

```bash
cd projects/complyscan
npm install
```

### 步骤 2: 启动开发服务器

```bash
npm run dev:node
```

### 步骤 3: 测试

```bash
curl http://localhost:3000/
```

---

## API 端点

部署后可用的端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/` | GET | 健康检查 |
| `/api/scan` | POST | 创建扫描任务 |
| `/api/scan/:id` | GET | 获取扫描结果 |
| `/api/github/auth` | POST | GitHub OAuth 认证 |

---

## 环境变量

| 变量 | 必需 | 默认值 | 描述 |
|------|------|--------|------|
| `PORT` | 否 | 3000 | 服务端口 |
| `DATABASE_PATH` | 否 | 内存 | SQLite 数据库路径 |
| `STORAGE_TYPE` | 否 | memory | 存储类型：memory/local |
| `CACHE_TYPE` | 否 | memory | 缓存类型：memory/redis |
| `GITHUB_CLIENT_ID` | 是 | - | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | 是 | - | GitHub OAuth Client Secret |

---

## 测试脚本

运行本地测试：

```bash
npm test
```

或手动测试：

```bash
npx tsx test.ts
```

---

## 故障排除

### 问题：端口被占用

```bash
PORT=3001 npm run dev:node
```

### 问题：数据库错误

```bash
rm -rf data/database.sqlite*
npm run dev:node
```

### 问题：依赖冲突

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 下一步

部署成功后：

1. **配置 GitHub OAuth App** - 创建并获取 Client ID/Secret
2. **设置环境变量** - 在部署平台配置
3. **运行完整测试** - 验证所有端点
4. **启动 Product Hunt 发布** - 参考 `docs/PRODUCT_HUNT.md`

---

## 支持的平台

| 平台 | 免费额度 | 数据库 | 推荐度 |
|------|----------|--------|--------|
| Vercel | 100GB/月 | ❌ | ⭐⭐⭐⭐⭐ |
| Railway | $5 免费额度 | ✅ | ⭐⭐⭐⭐ |
| Render | 750 小时/月 | ✅ | ⭐⭐⭐⭐ |
| Fly.io | 3 VM 免费 | ✅ | ⭐⭐⭐ |

---

## 联系

- 项目位置: `projects/complyscan/`
- 文档: `docs/PRODUCT_HUNT.md`
- 问题提交: GitHub Issues
