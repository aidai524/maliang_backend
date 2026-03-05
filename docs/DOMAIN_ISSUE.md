# 域名配置问题说明

## 问题描述

小程序使用 `dream-api.newpai.cn` 域名调用 API 时返回 401 错误。

## 原因分析

域名 DNS 解析到了错误的服务器：

- **当前服务器 IP**: `172.104.181.118`
- **dream-api.newpai.cn 解析到**: `139.224.213.118` ❌
- **dream-api.sendto.you 解析到**: `172.104.181.118` ✅

## 解决方案

### 方案 1：修改小程序配置（推荐，立即生效）

修改小程序的 API 请求域名：

```javascript
// 从
const API_BASE_URL = 'https://dream-api.newpai.cn';

// 改为
const API_BASE_URL = 'https://dream-api.sendto.you';
```

**优点**：
- 立即生效
- 无需等待 DNS 传播
- 无需修改服务器配置

**需要做的事情**：
1. 修改小程序代码中的 API 域名
2. 在微信小程序后台添加合法域名：`https://dream-api.sendto.you`
3. 重新发布小程序

### 方案 2：修改 DNS 解析（需要时间）

将 `dream-api.newpai.cn` 的 DNS 记录指向正确的服务器。

**步骤**：
1. 登录域名服务商控制台（阿里云/腾讯云等）
2. 找到 `newpai.cn` 的 DNS 解析设置
3. 修改 `dream-api` 子域名的 A 记录：
   - 类型：A 记录
   - 主机记录：dream-api
   - 记录值：172.104.181.118
4. 保存并等待生效（通常 10-30 分钟）

**验证 DNS 是否生效**：
```bash
# 在本地执行
nslookup dream-api.newpai.cn

# 应该返回
# Address: 172.104.181.118
```

## 当前可用的域名

以下域名已经正确配置并可以访问：

- ✅ **dream-api.sendto.you** - 后端 API
- ✅ **admin.sendto.you** - 管理后台

## 附加问题：短信流控

在测试过程中发现阿里云短信服务触发了天级流控限制：
```
isv.BUSINESS_LIMIT_CONTROL - 触发号码天级流控Permits:40
```

**原因**：测试手机号（13800138000）今天已发送 40 条短信，达到每日限制。

**解决**：
- 使用真实的手机号进行测试
- 等待第二天限制重置
- 或联系阿里云提高短信配额

## 后端环境变量配置

当前 `/root/maliang_backend/backend/.env.production` 中的配置：

```bash
BASE_URL=https://dream-api.newpai.cn  # 可以改为 sendto.you
```

如果选择方案 1，建议同步修改这个配置：

```bash
# 修改环境变量
nano /root/maliang_backend/backend/.env.production

# 将 BASE_URL 改为
BASE_URL=https://dream-api.sendto.you

# 重启后端服务
cd /root/maliang_backend
docker-compose -f docker-compose.prod.yml restart backend
```

## 推荐方案

**建议使用方案 1**（修改小程序配置），原因：
1. 立即生效，无需等待
2. `sendto.you` 域名已经配置完善
3. SSL 证书已经部署
4. Nginx 配置已经优化

---
最后更新: 2026-03-05
