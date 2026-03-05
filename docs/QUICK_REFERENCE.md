# 快速参考

## 服务访问地址

- **后端 API**: https://dream-api.sendto.you/
- **管理后台**: https://admin.sendto.you/
- **宝塔面板**: https://172.104.181.118:18501/cae71bc0

## 管理后台登录

**Admin Key**: `admin_secret_key_change_in_production`

访问 https://admin.sendto.you/ 并输入上述密钥即可登录。

## 常用命令

### 服务管理

```bash
# 启动所有服务
cd /root/maliang_backend
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker logs dream_backend -f --tail 50
docker logs dream_admin -f --tail 50
```

### Nginx 管理（宝塔）

```bash
# 检查配置
/www/server/nginx/sbin/nginx -t

# 重启
/www/server/nginx/sbin/nginx -s reload

# 查看进程
ps aux | grep nginx
# 必须是: /www/server/nginx/sbin/nginx
# 不能是: /usr/sbin/nginx
```

### 数据库操作

```bash
# 连接数据库
docker exec -it dream_postgres psql -U dream_user -d dream_wechat

# 查看用户
docker exec dream_postgres psql -U dream_user -d dream_wechat \
  -c "SELECT id, phone, vip_level FROM users LIMIT 10;"

# 备份数据库
docker exec dream_postgres pg_dump -U dream_user dream_wechat > backup.sql
```

## API 测试

```bash
# 健康检查
curl -k https://dream-api.sendto.you/v1/health

# 查看 API 信息
curl -k https://dream-api.sendto.you/v1/

# 测试管理接口（需要 Admin Key）
curl -k https://dream-api.sendto.you/v1/admin/stats \
  -H "X-Admin-Key: admin_secret_key_change_in_production"

# 查看用户列表
curl -k https://dream-api.sendto.you/v1/admin/users \
  -H "X-Admin-Key: admin_secret_key_change_in_production"
```

## 常见问题快速解决

### API 无法访问（404）

```bash
# 停止系统 nginx
systemctl stop nginx

# 启动宝塔 nginx
/www/server/nginx/sbin/nginx

# 验证
curl -k https://dream-api.sendto.you/v1/health
```

### 管理后台无法登录

1. 确认使用正确的 Admin Key
2. 检查后端服务是否运行：`docker ps | grep dream_backend`
3. 重启管理后台：`docker-compose -f docker-compose.prod.yml restart admin`

### 服务全部重启

```bash
cd /root/maliang_backend

# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 等待 60 秒
sleep 60

# 启动 Nginx
/www/server/nginx/sbin/nginx
```

## 重要文件位置

- 项目根目录: `/root/maliang_backend`
- Docker Compose: `/root/maliang_backend/docker-compose.prod.yml`
- 后端环境变量: `/root/maliang_backend/backend/.env.production`
- Nginx 配置: `/www/server/panel/vhost/nginx/`
- 日志目录: `/www/wwwlogs/`
- 服务管理文档: `/root/maliang_backend/docs/SERVICE_MANAGEMENT.md`
- 管理后台指南: `/root/maliang_backend/docs/ADMIN_LOGIN.md`

## 默认配置

- 数据库用户: `dream_user`
- 数据库密码: `Dream@2024Secure`
- 数据库名: `dream_wechat`
- Redis: 无密码
- 后端端口: 3000
- 管理后台端口: 3002

---
最后更新: 2026-03-05
