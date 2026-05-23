# 部署说明

## 环境要求

- Node.js 20 LTS 或 22 LTS
- npm
- PostgreSQL 16+
- Nginx
- PM2 或 systemd 用于进程守护

## 环境变量

复制示例文件并填写生产值：

```bash
cp .env.example .env
```

必需变量：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
SESSION_SECRET="replace-with-a-long-random-secret"
```

生产环境必须配置强随机 `SESSION_SECRET`，禁止使用默认开发密钥。

```bash
openssl rand -base64 48
```

## PostgreSQL 准备

生产建议使用独立 PostgreSQL 实例或云数据库，创建独立账号和数据库：

```sql
CREATE DATABASE ai_edu_admin;
CREATE USER ai_edu_user WITH ENCRYPTED PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE ai_edu_admin TO ai_edu_user;
```

本地开发可参考 `docker-compose.yml` 启动 PostgreSQL：

```bash
docker compose up -d
```

## Prisma migrate deploy

生产环境不要使用 `prisma migrate dev`，使用：

```bash
npx prisma generate
npx prisma migrate deploy
```

首次部署如需初始化账号和示例数据，可执行：

```bash
npm run db:seed
```

## npm build / start

推荐部署流程：

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

指定端口：

```bash
PORT=3000 npm run start
```

## PM2 示例

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start npm --name ai-edu-admin -- run start
pm2 save
pm2 startup
```

如需指定端口：

```bash
PORT=3000 pm2 start npm --name ai-edu-admin -- run start
```

## Nginx 示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

## HTTPS 注意事项

生产环境必须启用 HTTPS。项目在 `NODE_ENV=production` 时会设置安全 Cookie，如果没有 HTTPS，登录会话可能异常。

Certbot 示例：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

建议增加安全响应头：

```nginx
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;
add_header Referrer-Policy strict-origin-when-cross-origin;
```

## 数据备份

每日备份：

```bash
pg_dump "$DATABASE_URL" | gzip > backups/ai_edu_admin_$(date +%F).sql.gz
```

建议：

- 每日全量备份，保留 14-30 天
- 上线前手动备份一次
- 备份文件同步到对象存储或另一台服务器
- 定期演练恢复

恢复示例：

```bash
gunzip -c ai_edu_admin_2026-05-23.sql.gz | psql "$DATABASE_URL"
```

## 部署前检查

- [ ] Node.js 版本符合要求
- [ ] PostgreSQL 已创建生产数据库和账号
- [ ] `DATABASE_URL` 指向生产数据库
- [ ] `SESSION_SECRET` 已设置强随机值
- [ ] `.env` 未提交到 Git
- [ ] 已执行 `npm ci`
- [ ] 已执行 `npx prisma generate`
- [ ] 已执行 `npx prisma migrate deploy`
- [ ] 首次部署已确认是否执行 `npm run db:seed`
- [ ] 已执行 `npm run build`
- [ ] Nginx 反向代理已配置
- [ ] HTTPS 证书已配置
- [ ] 数据库已备份

## 部署后冒烟测试

- [ ] `GET /api/health` 返回 `{ status: "ok", database: "ok" }`
- [ ] 打开首页，未登录跳转登录页
- [ ] 管理员账号可登录
- [ ] 8 个一级页面可访问
- [ ] CRM 线索可新增和导入
- [ ] 学员可导入
- [ ] 题库可导入
- [ ] 数据中心统计正常
- [ ] 教研内容可导出 Word
- [ ] SOP 任务、打卡、周报、评分正常
- [ ] 系统设置用户、校区、字典正常
