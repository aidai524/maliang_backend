# Dream API 部署指南 (Ubuntu 24.04)

适用于 2GB 内存 VPS 的轻量级部署方案，不使用 Docker。

## 系统要求

- Ubuntu 24.04 LTS
- 2GB+ 内存
- 20GB+ 磁盘空间
- Root 权限

## 资源预估

在 2GB 内存 VPS 上的内存使用预估：

| 服务 | 内存使用 |
|------|---------|
| PostgreSQL | ~100-200MB |
| Redis | ~50-128MB |
| Node.js (后端) | ~200-400MB |
| Node.js (管理后台) | ~150-300MB |
| Nginx | ~20-50MB |
| 系统 | ~300-400MB |
| **总计** | ~1-1.5GB |

建议配置 2GB swap 作为备用。

## 快速部署

### 1. 上传部署脚本

```bash
# 在本地执行，上传脚本到服务器
scp deploy-ubuntu.sh root@your-server-ip:/root/
```

### 2. 登录服务器执行

```bash
ssh root@your-server-ip

# 添加执行权限
chmod +x /root/deploy-ubuntu.sh

# 运行部署脚本
/root/deploy-ubuntu.sh
```

选择 `1) 完整安装` 进行首次部署。

### 3. 配置环境变量

部署完成后，编辑后端配置文件：

```bash
nano /opt/dream-api/backend/.env.production
```

填写以下必要配置：

```env
# JWT 密钥（必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-this

# 微信小程序配置
WECHAT_APPID=your_real_appid
WECHAT_SECRET=your_real_secret

# 第三方 AI API
THIRD_PARTY_API_BASE_URL=https://api.sendto.you
THIRD_PARTY_API_KEY=your_real_api_key

# R2 存储配置
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_BASE_URL=https://your-cdn.com

# 管理员 API Key
ADMIN_API_KEY=your_admin_api_key

# 阿里云短信
SMS_MODE=aliyun
ALIYUN_SMS_ACCESS_KEY_ID=your_access_key
ALIYUN_SMS_ACCESS_KEY_SECRET=your_secret
ALIYUN_SMS_SIGN_NAME=your_sign
ALIYUN_SMS_TEMPLATE_CODE=your_template
```

### 4. 重启服务

```bash
pm2 restart all
```

### 5. 配置 SSL（可选但推荐）

```bash
/root/deploy-ubuntu.sh
# 选择 5) 仅配置 SSL
```

## 手动部署步骤

如果需要手动部署，请按以下步骤操作：

### 1. 系统更新

```bash
apt update && apt upgrade -y
```

### 2. 安装 Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

### 3. 安装 PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql

# 创建数据库
sudo -u postgres psql
CREATE USER dream_user WITH PASSWORD 'your_password';
CREATE DATABASE dream_wechat OWNER dream_user;
GRANT ALL PRIVILEGES ON DATABASE dream_wechat TO dream_user;
\q
```

### 4. 安装 Redis

```bash
apt install -y redis-server

# 内存优化配置
echo "maxmemory 128mb" >> /etc/redis/redis.conf
echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf

systemctl restart redis-server
systemctl enable redis-server
```

### 5. 部署代码

```bash
mkdir -p /opt/dream-api
cd /opt/dream-api
git clone https://github.com/aidai524/maliang_backend.git .

# 后端
cd backend
npm ci
cp .env .env.production  # 然后编辑配置
npm run build

# 管理后台
cd ../admin
npm ci
npm run build
```

### 6. 配置 PM2

```bash
cd /opt/dream-api

# 启动后端
pm2 start backend/dist/main.js --name dream-backend

# 启动管理后台
pm2 start admin/node_modules/next/dist/bin/next --name dream-admin -- start -p 3002

# 保存配置
pm2 save
pm2 startup
```

### 7. 配置 Nginx

```bash
apt install -y nginx

cat > /etc/nginx/sites-available/dream-api <<'EOF'
server {
    listen 80;
    server_name api.newpai.cn;

    client_max_body_size 20M;

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
    }
}

server {
    listen 80;
    server_name admin.newpai.cn;

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
EOF

ln -sf /etc/nginx/sites-available/dream-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

### 8. 配置 SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.newpai.cn -d admin.newpai.cn
```

## 常用运维命令

### 服务管理

```bash
# 查看所有服务状态
pm2 status

# 查看日志
pm2 logs dream-backend
pm2 logs dream-admin

# 实时监控
pm2 monit

# 重启服务
pm2 restart dream-backend
pm2 restart dream-admin
pm2 restart all

# 停止服务
pm2 stop all

# 查看内存使用
free -h
```

### 代码更新

```bash
cd /opt/dream-api
git pull origin main

# 重新构建后端
cd backend
npm ci
npm run build
pm2 restart dream-backend

# 重新构建管理后台
cd ../admin
npm ci
npm run build
pm2 restart dream-admin
```

### 数据库管理

```bash
# 连接数据库
sudo -u postgres psql -d dream_wechat

# 备份数据库
pg_dump -U dream_user dream_wechat > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -U dream_user dream_wechat < backup.sql
```

### 日志查看

```bash
# PM2 日志
pm2 logs

# Nginx 访问日志
tail -f /var/log/nginx/dream-api_access.log

# Nginx 错误日志
tail -f /var/log/nginx/dream-api_error.log

# PostgreSQL 日志
tail -f /var/log/postgresql/postgresql-16-main.log
```

## 故障排查

### 后端无法启动

```bash
# 检查日志
pm2 logs dream-backend --lines 100

# 检查配置文件
cat /opt/dream-api/backend/.env.production

# 手动测试启动
cd /opt/dream-api/backend
node dist/main.js
```

### 数据库连接失败

```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 检查连接
sudo -u postgres psql -c "SELECT 1"

# 检查用户权限
sudo -u postgres psql -c "\du"
```

### 内存不足

```bash
# 检查内存使用
free -h
htop

# 检查 swap
swapon --show

# 如果没有 swap，创建一个
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

### Nginx 502 错误

```bash
# 检查后端是否运行
pm2 status

# 检查端口是否监听
ss -tlnp | grep 3000

# 检查 Nginx 配置
nginx -t
```

## 阿里云安全组配置

在阿里云控制台配置安全组，开放以下端口：

| 端口 | 协议 | 说明 |
|-----|------|-----|
| 22 | TCP | SSH |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |

## 性能优化建议

### 对于 2GB 内存 VPS

1. **使用 swap**: 建议配置 2GB swap
2. **限制 Redis 内存**: 设置 `maxmemory 128mb`
3. **PM2 单实例**: 不要使用 cluster 模式
4. **关闭不必要服务**: 检查并停止不需要的服务

### 监控建议

```bash
# 安装 htop
apt install -y htop

# 实时监控
htop

# 磁盘使用
df -h

# PM2 监控
pm2 monit
```
