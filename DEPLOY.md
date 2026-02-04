# Dream API 部署指南

本文档介绍如何将 Dream API 部署到生产服务器。

## 目录

1. [服务器要求](#服务器要求)
2. [方案一：Docker 部署（推荐）](#方案一docker-部署推荐)
3. [方案二：手动部署](#方案二手动部署)
4. [Nginx 反向代理](#nginx-反向代理)
5. [SSL 证书配置](#ssl-证书配置)
6. [常见问题](#常见问题)

---

## 服务器要求

### 最低配置
- CPU: 2 核
- 内存: 4GB
- 磁盘: 40GB SSD
- 系统: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### 推荐配置
- CPU: 4 核
- 内存: 8GB
- 磁盘: 100GB SSD
- 系统: Ubuntu 22.04 LTS

### 需要开放的端口
- 80 (HTTP)
- 443 (HTTPS)
- 22 (SSH)

---

## 方案一：Docker 部署（推荐）

### 1. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录以生效
exit
```

### 2. 上传代码到服务器

```bash
# 方式一：Git 克隆
git clone https://github.com/your-repo/dream-api.git
cd dream-api

# 方式二：本地上传
scp -r ./dream-api user@your-server:/home/user/
```

### 3. 配置生产环境变量

```bash
cd backend

# 复制环境变量模板
cp .env.example .env.production

# 编辑生产环境配置
nano .env.production
```

**`.env.production` 关键配置：**

```env
# 环境
NODE_ENV=production

# 数据库（Docker 内部使用容器名）
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=dream_user
DATABASE_PASSWORD=your_strong_password_here
DATABASE_NAME=dream_wechat

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT（务必使用强密钥）
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-at-least-32-chars
JWT_EXPIRATION=7d

# 微信配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# 第三方 AI 服务
THIRD_PARTY_API_BASE_URL=https://ai-service.example.com
THIRD_PARTY_API_KEY=your_api_key

# R2 存储
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=dream-assets
R2_PUBLIC_BASE_URL=https://assets.yourdomain.com

# CORS（生产环境设置具体域名）
CORS_ORIGIN=https://yourdomain.com

# 管理员密钥
ADMIN_API_KEY=your_secure_admin_key

# 每日生成限额
GENERATION_DAILY_LIMIT_NORMAL=2
GENERATION_DAILY_LIMIT_VIP=20
GENERATION_DAILY_LIMIT_SVIP=100
```

### 4. 创建生产环境 Docker Compose

```bash
# 在项目根目录创建
nano docker-compose.prod.yml
```

内容见项目中的 `docker-compose.prod.yml` 文件。

### 5. 启动服务

```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 6. 初始化数据库

```bash
# 进入 backend 容器执行数据库迁移
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# 执行数据种子
docker-compose -f docker-compose.prod.yml exec backend npm run seed
```

---

## 方案二：手动部署

### 1. 安装依赖

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装 Redis
sudo apt install -y redis-server

# 安装 PM2（进程管理）
sudo npm install -g pm2
```

### 2. 配置 PostgreSQL

```bash
sudo -u postgres psql

# 创建数据库和用户
CREATE USER dream_user WITH PASSWORD 'your_password';
CREATE DATABASE dream_wechat OWNER dream_user;
GRANT ALL PRIVILEGES ON DATABASE dream_wechat TO dream_user;
\q
```

### 3. 配置 Redis

```bash
sudo nano /etc/redis/redis.conf
# 设置 requirepass your_redis_password

sudo systemctl restart redis
```

### 4. 部署后端

```bash
cd /home/user/dream-api/backend

# 安装依赖
npm ci --production

# 构建
npm run build

# 配置环境变量
cp .env.example .env
nano .env  # 修改为生产配置

# 使用 PM2 启动
pm2 start dist/main.js --name dream-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 部署 Admin 前端

```bash
cd /home/user/dream-api/admin

# 安装依赖
npm ci

# 配置环境变量
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.production

# 构建
npm run build

# 使用 PM2 启动
pm2 start npm --name dream-admin -- start -- -p 3002

pm2 save
```

---

## Nginx 反向代理

### 1. 安装 Nginx

```bash
sudo apt install -y nginx
```

### 2. 配置站点

```bash
sudo nano /etc/nginx/sites-available/dream-api
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 上传文件大小限制
        client_max_body_size 50M;
    }
}

# Admin 前端
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/dream-api /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

## SSL 证书配置

### 使用 Certbot（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（会自动配置 Nginx）
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

---

## 常用运维命令

### Docker 部署

```bash
# 查看日志
docker-compose -f docker-compose.prod.yml logs -f backend

# 重启服务
docker-compose -f docker-compose.prod.yml restart backend

# 更新代码后重新部署
git pull
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend

# 进入容器
docker-compose -f docker-compose.prod.yml exec backend sh

# 数据库备份
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U dream_user dream_wechat > backup.sql
```

### PM2 部署

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs dream-backend

# 重启
pm2 restart dream-backend

# 更新代码
cd /home/user/dream-api/backend
git pull
npm ci
npm run build
pm2 restart dream-backend
```

---

## 常见问题

### 1. 数据库连接失败

检查：
- PostgreSQL 服务是否运行
- 用户名密码是否正确
- Docker 网络是否正常

### 2. 微信登录失败

检查：
- `WECHAT_APPID` 和 `WECHAT_SECRET` 是否正确
- 服务器 IP 是否在微信白名单中

### 3. 图片上传失败

检查：
- R2 配置是否正确
- Nginx `client_max_body_size` 设置

### 4. 502 Bad Gateway

检查：
- 后端服务是否正常运行
- 端口是否正确
- 防火墙是否开放

---

## 监控建议

1. **日志监控**: 使用 ELK Stack 或 Loki + Grafana
2. **性能监控**: 使用 Prometheus + Grafana
3. **错误追踪**: 使用 Sentry
4. **服务器监控**: 使用 Netdata 或 Node Exporter

---

## 更新日志

- 2026-01-29: 初始版本
