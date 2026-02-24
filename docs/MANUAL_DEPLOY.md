# ComplyScan - 手动部署指南

> **注意**: 本指南用于 Cloudflare Workers 部署。由于 wrangler 需要浏览器 OAuth 认证，部分步骤需要人工完成。

---

## 前置条件

1. **Cloudflare 账号** - 免费注册 https://dash.cloudflare.com/
2. **GitHub 账号** - 用于 OAuth App 配置
3. **Node.js 18+** - 本地开发环境
4. **Wrangler CLI** - 通过 npm 安装

---

## 步骤 1: 安装 Wrangler 并登录

```bash
# 全局安装 wrangler (推荐)
npm install -g wrangler

# 登录 Cloudflare (会打开浏览器)
wrangler login
```

**登录成功后**，你会看到类似输出：
```
✅ Successfully logged in with [your-email]
```

---

## 步骤 2: 创建 Cloudflare 资源

### 2.1 创建 D1 数据库

```bash
wrangler d1 create complyscan-db
```

**保存输出中的 database_id**:
```
✅ Successfully created DB!
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2.2 创建 R2 存储桶

```bash
wrangler r2 bucket create complyscan-storage
```

**输出**:
```
✅ Successfully created bucket!
bucket_name = "complyscan-storage"
```

### 2.3 创建 KV 命名空间

```bash
wrangler kv namespace create complyscan-cache
```

**保存输出中的 id**:
```
✅ Successfully created namespace!
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 步骤 3: 更新 wrangler.toml

将步骤 2 中获取的 ID 填入 `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "complyscan-db"
database_id = "YOUR_D1_DATABASE_ID"  # 替换为实际 ID

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "complyscan-storage"

[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"  # 替换为实际 ID
```

---

## 步骤 4: 初始化数据库

```bash
# 执行 schema.sql
wrangler d1 execute complyscan-db --file=schema.sql
```

**验证表创建**:
```bash
wrangler d1 execute complyscan-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

应该看到：users, scans, findings, github_installations, webhook_events, rate_limits, sessions

---

## 步骤 5: 配置环境变量 (Secrets)

### 5.1 设置 GitHub OAuth Secrets

首先创建 GitHub OAuth App:
1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: `ComplyScan`
   - Homepage URL: `https://your-worker.workers.dev` (部署后获取)
   - Authorization callback URL: `https://your-worker.workers.dev/api/github/callback`
4. 创建后保存 `Client ID` 和 `Client Secret`

### 5.2 设置 Wrangler Secrets

```bash
# GitHub OAuth
wrangler secret put GITHUB_CLIENT_ID
# 粘贴 Client ID

wrangler secret put GITHUB_CLIENT_SECRET
# 粘贴 Client Secret

# JWT Secret (用于 session tokens) - 生成随机字符串
wrangler secret put JWT_SECRET
# 输入: openssl rand -base64 32

# Webhook Secret (可选)
wrangler secret put GITHUB_WEBHOOK_SECRET
# 输入随机字符串
```

---

## 步骤 6: 部署到 Cloudflare Workers

```bash
# 构建 + 部署
npm run deploy
```

**成功输出**:
```
✅ Successfully published your Worker to:
  https://complyscan-api.YOUR_SUBDOMAIN.workers.dev
```

---

## 步骤 7: 验证部署

### 7.1 健康检查
```bash
curl https://your-worker.workers.dev/
# 应返回: {"status":"healthy","version":"0.1.0"}
```

### 7.2 数据库就绪检查
```bash
curl https://your-worker.workers.dev/ready
# 应返回: {"status":"ready","database":"connected"}
```

### 7.3 测试扫描 API
```bash
curl -X POST https://your-worker.workers.dev/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "lockfile": "{\"name\":\"my-project\",\"lockfileVersion\":3,\"packages\":{\"node_modules\":{\"mit-package\":{\"version\":\"1.0.0\",\"resolved\":\"https://registry.npmjs.org/mit-package/-/mit-package-1.0.0.tgz\",\"integrity\":\"sha512-xxx\",\"license\":\"MIT\"}}}}",
    "packageManager": "npm"
  }'
```

---

## 步骤 8: 配置 GitHub Actions (用户集成)

### 8.1 创建 GitHub Action

在 `.github/workflows/complyscan-action.yml`:

```yaml
name: ComplyScan
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  complyscan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run ComplyScan
        run: |
          curl -X POST https://your-worker.workers.dev/api/scan \
            -H "Content-Type: application/json" \
            -d "{\"lockfile\":\"$(cat package-lock.json | jq -Rs .)\",\"packageManager\":\"npm\",\"owner\":\"$GITHUB_REPOSITORY_OWNER\",\"repo\":\"$(basename $GITHUB_REPOSITORY)\",\"branch\":\"$GITHUB_REF_NAME\"}"
```

---

## 常见问题

### Q: wrangler login 失败
**A**: 确保网络可以访问 Cloudflare，或在 `.env` 中设置 `CLOUDFLARE_API_TOKEN`。

### Q: D1 database_id 无效
**A**: 检查 `wrangler.toml` 中的 ID 是否与创建时的输出一致。

### Q: 部署后 401 错误
**A**: 检查 GitHub OAuth secrets 是否正确设置。

### Q: Webhook 不工作
**A**: 确保 GitHub App 的 webhook URL 配置正确，secret 匹配。

---

## 费用估算

| 资源 | 免费额度 | 预计成本 (100 用户) |
|------|----------|---------------------|
| Workers | 100,000 请求/天 | $0 |
| D1 | 5GB 存储 | $0 |
| R2 | 10GB 存储 | $0 |
| KV | 100,000 读取/天 | $0 |
| **总计** | - | **$0-1.25/月** |

超出免费额度后，按量计费。

---

## 监控和日志

### 查看 Worker 日志
```bash
wrangler tail
```

### 查看 D1 查询
在 Cloudflare Dashboard > D1 > Queries

### 查看分析
在 Cloudflare Dashboard > Workers > Analytics

---

## 回滚和更新

### 更新代码
```bash
# 修改代码后
npm run deploy
```

### 回滚到上一版本
```bash
wrangler rollback
```

### 删除 Worker
```bash
wrangler delete complyscan-api
```

---

## 下一步

部署完成后：

1. **测试端到端流程** - 从 GitHub OAuth 到扫描结果
2. **设置 Stripe** - 用于订阅支付（如需要）
3. **配置域名** - 在 Cloudflare 添加自定义域名
4. **准备 Product Hunt 发布** - 参考 `docs/PRODUCT_HUNT.md`

---

## 联系和支持

- GitHub Issues: https://github.com/auto-company/complyscan/issues
- Email: support@auto.company (待设置)

---

*Last updated: 2026-02-24*
*Author: Auto Company - devops-hightower*
