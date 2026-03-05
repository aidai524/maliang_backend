# 服务管理指南

本文档记录了 Dream WeChat 后端服务的部署、启动和管理流程，以避免重复踩坑。

## 架构说明

### 服务组件
- **后端 API**: NestJS 应用（端口 3000）
- **管理后台**: Next.js 应用（端口 3002）
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **反向代理**: 宝塔面板的 Nginx

### 域名映射
- `dream-api.sendto.you` -> 后端 API (localhost:3000)
- `admin.sendto.you` -> 管理后台 (localhost:3002)

## 重要提示

### ⚠️ Nginx 管理

**系统自带 Nginx vs 宝塔 Nginx**

本服务器使用**宝塔面板的 Nginx**，配置文件位于：
- 主配置: `/www/server/nginx/conf/nginx.conf`
- 虚拟主机: `/www/server/panel/vhost/nginx/*.conf`

**不要使用系统自带的 Nginx**（/usr/sbin/nginx），它不会加载宝塔的配置！

#### 正确的 Nginx 操作命令

```bash
# 检查配置
/www/server/nginx/sbin/nginx -t

# 启动 Nginx
/www/server/nginx/sbin/nginx

# 重启 Nginx
/www/server/nginx/sbin/nginx -s reload

# 停止 Nginx
/www/server/nginx/sbin/nginx -s stop

# 查看 Nginx 进程（确认是宝塔的）
ps aux | grep nginx
# 应该看到: /www/server/nginx/sbin/nginx
```

#### 常见问题：API 无法访问

**症状**: 域名访问 404，但本地 localhost:3000 可以访问

**原因**: 运行了系统自带的 nginx，而不是宝塔的 nginx

**解决方案**:
```bash
# 1. 停止系统 nginx
systemctl stop nginx
systemctl disable nginx

# 2. 启动宝塔 nginx
/www/server/nginx/sbin/nginx

# 3. 验证
ps aux | grep nginx
curl -k https://dream-api.sendto.you/v1/health
```

## Docker 服务管理

### 启动所有服务

```bash
cd /root/maliang_backend

# 使用生产环境配置启动
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f [服务名]
```

### 重启单个服务

```bash
# 重启后端
docker-compose -f docker-compose.prod.yml restart backend

# 重启管理后台
docker-compose -f docker-compose.prod.yml restart admin

# 重启数据库
docker-compose -f docker-compose.prod.yml restart postgres

# 重启 Redis
docker-compose -f docker-compose.prod.yml restart redis
```

### 停止所有服务

```bash
docker-compose -f docker-compose.prod.yml down
```

### 查看服务日志

```bash
# 查看后端日志
docker logs dream_backend --tail 100 -f

# 查看管理后台日志
docker logs dream_admin --tail 100 -f

# 查看所有容器状态
docker ps -a
```

## 服务启动完整流程

### 1. 启动 Docker 服务

```bash
cd /root/maliang_backend
docker-compose -f docker-compose.prod.yml up -d
```

等待所有服务健康检查通过：
- dream_postgres (healthy)
- dream_redis (healthy)
- dream_backend (healthy)
- dream_admin (Up)

### 2. 启动 Nginx

```bash
# 确认没有系统 nginx 在运行
systemctl status nginx
# 如果在运行，停止它
systemctl stop nginx

# 启动宝塔 nginx
/www/server/nginx/sbin/nginx
```

### 3. 验证服务

```bash
# 检查后端 API
curl -k https://dream-api.sendto.you/v1/health
# 应该返回: {"status":"ok",...}

curl -k https://dream-api.sendto.you/v1/
# 应该返回: {"message":"Welcome to Dream WeChat Backend API",...}

# 检查管理后台
curl -I https://admin.sendto.you/
# 应该返回: HTTP/2 200

# 检查 Docker 容器
docker ps
# 应该看到 4 个容器都在运行
```

## 环境变量配置

### 后端环境变量
位置: `/root/maliang_backend/backend/.env.production`

关键配置：
- 数据库连接
- Redis 连接
- JWT 密钥
- 阿里云短信配置
- R2 存储配置

### 管理后台环境变量
在 `docker-compose.prod.yml` 中配置：
- `NEXT_PUBLIC_API_URL`: https://dream-api.sendto.you

## 数据库管理

### 连接数据库

```bash
# 通过 Docker 连接
docker exec -it dream_postgres psql -U dream_user -d dream_wechat

# 查看所有表
\dt

# 查看用户表
SELECT id, username, role, "isVip" FROM users;
```

### 数据备份

```bash
# 备份数据库
docker exec dream_postgres pg_dump -U dream_user dream_wechat > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20260305.sql | docker exec -i dream_postgres psql -U dream_user dream_wechat
```

## 常见问题排查

### 1. API 返回 404

**检查清单**:
- [ ] Docker 容器是否运行: `docker ps`
- [ ] 后端健康检查: `curl http://localhost:3000/v1/health`
- [ ] Nginx 是否是宝塔版本: `ps aux | grep nginx`
- [ ] Nginx 配置是否正确: `www/server/nginx/sbin/nginx -t`

### 2. 管理后台无法登录

**检查清单**:
- [ ] 后端 API 是否可访问
- [ ] 浏览器控制台是否有错误
- [ ] 检查后端日志: `docker logs dream_backend --tail 50`
- [ ] 检查管理后台日志: `docker logs dream_admin --tail 50`

### 3. 数据库连接失败

**检查清单**:
- [ ] PostgreSQL 容器是否运行: `docker ps | grep postgres`
- [ ] 数据库是否健康: `docker exec dream_postgres pg_isready`
- [ ] 查看后端日志中的数据库错误

### 4. 服务重启后无法访问

**可能原因**:
1. Docker 服务未完全启动
2. Nginx 使用了错误的版本

**解决步骤**:
```bash
# 1. 等待 Docker 完全启动（约 40 秒）
docker-compose -f docker-compose.prod.yml ps

# 2. 确认使用宝塔 Nginx
ps aux | grep nginx
# 如果看到 /usr/sbin/nginx，执行:
systemctl stop nginx
/www/server/nginx/sbin/nginx
```

## 宝塔面板操作

### 通过宝塔面板管理

1. 登录宝塔面板
2. 网站 -> 找到对应域名
3. 可以修改 Nginx 配置、SSL 证书等

### 常用宝塔命令

```bash
# 查看宝塔信息
bt default

# 修改面板密码
bt 5

# 重启面板
bt restart
```

## SSL 证书管理

### Let's Encrypt 证书

证书位置: `/etc/letsencrypt/live/dream-api.sendto.you/`

自动续期由宝塔面板管理。

### Cloudflare Origin 证书

证书位置: `/etc/ssl/cloudflare/origin-cert.pem`

用于 Cloudflare CDN 到源站的加密。

## 监控和日志

### 日志位置

- 后端日志: `docker logs dream_backend`
- 管理后台日志: `docker logs dream_admin`
- Nginx 访问日志: `/www/wwwlogs/dream-api.sendto.you.log`
- Nginx 错误日志: `/www/wwwlogs/dream-api.sendto.you.error.log`

### 实时监控

```bash
# 监控所有容器
watch -n 1 'docker ps'

# 监控后端日志
docker logs dream_backend -f --tail 50

# 监控 Nginx 访问日志
tail -f /www/wwwlogs/dream-api.sendto.you.log
```

## 紧急恢复流程

如果服务完全不可用：

```bash
# 1. 停止所有服务
docker-compose -f docker-compose.prod.yml down
systemctl stop nginx

# 2. 清理 Docker 缓存（可选）
docker system prune -f

# 3. 重新启动
docker-compose -f docker-compose.prod.yml up -d

# 4. 等待服务健康（约 1 分钟）
sleep 60
docker-compose -f docker-compose.prod.yml ps

# 5. 启动 Nginx
/www/server/nginx/sbin/nginx

# 6. 验证
curl -k https://dream-api.sendto.you/v1/health
```

## 联系信息

如有问题，请检查：
1. 本文档的常见问题部分
2. Docker 容器日志
3. Nginx 错误日志
4. 宝塔面板的服务状态

---
最后更新: 2026-03-05
