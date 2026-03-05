# 管理后台登录指南

## 登录方式

管理后台使用 **API Key** 方式进行认证，而不是传统的用户名/密码登录。

### Admin API Key

当前配置的 Admin API Key 为：

```
admin_secret_key_change_in_production
```

**⚠️ 安全建议**：这是一个示例密钥，生产环境应该修改为强密码！

### 如何登录

1. 访问管理后台：https://admin.sendto.you/
2. 在登录页面输入 Admin API Key
3. 点击登录

系统会验证这个 Key 是否正确，如果正确则可以访问管理后台。

## 修改 Admin API Key

### 1. 生成新的密钥

```bash
# 生成一个随机的强密钥
openssl rand -base64 32
```

### 2. 更新环境变量

编辑 `/root/maliang_backend/backend/.env.production`：

```bash
nano /root/maliang_backend/backend/.env.production
```

修改这一行：
```
ADMIN_API_KEY=你的新密钥
```

### 3. 重启后端服务

```bash
cd /root/maliang_backend
docker-compose -f docker-compose.prod.yml restart backend
```

### 4. 验证

```bash
# 测试新的 Admin Key
curl -k https://dream-api.sendto.you/v1/admin/stats \
  -H "X-Admin-Key: 你的新密钥"
```

## 管理后台功能

登录后可以使用的功能：

### 1. 用户管理
- 查看所有用户列表
- 查看用户详情
- 修改用户信息
- 删除用户
- 设置/取消用户 VIP

### 2. VIP 管理
- 手动设置用户 VIP 等级（NORMAL/VIP/SVIP）
- 设置 VIP 过期时间
- 取消用户 VIP

### 3. 统计信息
- 总用户数
- VIP 用户数
- 今日新增用户
- 订单统计

### 4. 模板管理
- Prompt 模板管理
- 参数模板管理
- 创建/编辑/删除模板

## API 调用示例

### 获取统计信息

```bash
curl -k https://dream-api.sendto.you/v1/admin/stats \
  -H "X-Admin-Key: admin_secret_key_change_in_production"
```

### 获取用户列表

```bash
curl -k "https://dream-api.sendto.you/v1/admin/users?page=1&limit=20" \
  -H "X-Admin-Key: admin_secret_key_change_in_production"
```

### 设置用户 VIP

```bash
curl -k -X PUT https://dream-api.sendto.you/v1/admin/users/1/vip \
  -H "X-Admin-Key: admin_secret_key_change_in_production" \
  -H "Content-Type: application/json" \
  -d '{"vipLevel":"VIP","days":30}'
```

## 故障排查

### 无法登录

**可能原因**：
1. Admin Key 输入错误
2. 后端服务未启动
3. 网络连接问题

**解决步骤**：
```bash
# 1. 检查后端服务
docker ps | grep dream_backend

# 2. 检查 API 可访问性
curl -k https://dream-api.sendto.you/v1/health

# 3. 验证 Admin Key
curl -k https://dream-api.sendto.you/v1/admin/stats \
  -H "X-Admin-Key: admin_secret_key_change_in_production"
```

### 浏览器控制台错误

打开浏览器开发者工具（F12）查看 Console 标签页：

- **401 Unauthorized**: Admin Key 错误
- **Network Error**: 后端服务不可达
- **CORS Error**: 跨域问题（检查 CORS_ORIGIN 配置）

## Next.js Server Action 问题

如果看到类似错误：
```
Error: Failed to find Server Action "x". This request might be from an older or newer deployment.
```

**解决方案**：
```bash
# 重启管理后台容器
cd /root/maliang_backend
docker-compose -f docker-compose.prod.yml restart admin

# 清除浏览器缓存后重新访问
```

## 安全建议

1. **立即修改默认密钥**：使用强随机密钥替换默认的 Admin Key
2. **定期更换密钥**：建议每 3-6 个月更换一次
3. **限制访问**：如果可能，限制管理后台的 IP 访问
4. **使用 HTTPS**：确保始终通过 HTTPS 访问
5. **监控日志**：定期检查管理后台的访问日志

## 当前用户数据

查看当前数据库中的用户：

```bash
docker exec dream_postgres psql -U dream_user -d dream_wechat \
  -c "SELECT id, phone, nick_name, vip_level, points_balance, created_at FROM users ORDER BY id DESC LIMIT 10;"
```

---
最后更新: 2026-03-05
