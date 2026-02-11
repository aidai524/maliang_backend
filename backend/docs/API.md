# Dream WeChat Backend API Documentation

## Overview

Dream WeChat Backend API 为微信小程序提供 AI 图片生成服务的后端接口。

**Base URL:** `http://localhost:3000` (开发环境)

**API 版本前缀:** `/v1`

---

## 认证方式

### 1. 用户认证 (JWT)

大部分接口需要用户登录后获取的 JWT Token：

```
Authorization: Bearer <JWT_TOKEN>
```

### 2. 管理员认证 (API Key)

管理接口需要管理员 API Key：

```
X-Admin-Key: <ADMIN_API_KEY>
```

---

## API 端点列表

### 认证模块 (Auth)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/v1/auth/wechat-login` | 微信登录 | 无 |
| POST | `/v1/auth/send-code` | 发送短信验证码 | 无 |
| POST | `/v1/auth/phone-login` | 手机号登录/注册 | 无 |
| POST | `/v1/auth/bind-phone` | 绑定手机号 | JWT |
| POST | `/v1/auth/refresh-token` | 刷新 Token | JWT |
| GET | `/v1/auth/userinfo` | 获取用户信息 | JWT |
| GET | `/v1/auth/check` | 检查登录状态 | JWT |

### 用户模块 (Users)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/users/me` | 获取当前用户 | JWT |
| GET | `/v1/users/me/stats` | 获取用户统计 | JWT |

### 生成任务模块 (Jobs) - 本地记录

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/v1/jobs` | 创建生成任务 | JWT |
| GET | `/v1/jobs` | 获取任务列表 | JWT |
| GET | `/v1/jobs/quota` | 获取配额信息 | JWT |
| GET | `/v1/jobs/:jobId` | 获取任务详情 | JWT |
| DELETE | `/v1/jobs/:jobId` | 取消任务 | JWT |

### 代理模块 (Proxy) - 第三方 AI 服务

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/v1/proxy/images/generate` | 生成图片 | JWT |
| GET | `/v1/proxy/jobs` | 获取任务列表 | JWT |
| GET | `/v1/proxy/jobs/:jobId` | 获取任务详情 | JWT |
| DELETE | `/v1/proxy/jobs/:jobId` | 取消任务 | JWT |

### VIP 模块 (VIP)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/vip/plans` | 获取 VIP 套餐列表 | 无 |
| GET | `/v1/vip/info` | 获取 VIP 信息 | JWT |
| POST | `/v1/vip/purchase` | 购买 VIP | JWT |
| POST | `/v1/vip/orders` | 创建 VIP 订单 | JWT |

### 订单模块 (Orders)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/orders` | 获取订单列表 | JWT |
| GET | `/v1/orders/:orderId` | 获取订单详情 | JWT |
| POST | `/v1/orders/payment-callback` | 支付回调 | 无 |

### 收藏模块 (Favorites)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/v1/favorites` | 添加收藏 | JWT |
| DELETE | `/v1/favorites/:id` | 取消收藏 | JWT |
| GET | `/v1/favorites` | 获取收藏列表 | JWT |
| GET | `/v1/favorites/check` | 检查是否已收藏 | JWT |

### 画廊模块 (Gallery)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/gallery/images` | 获取画廊图片 | 无 |
| GET | `/v1/gallery/categories` | 获取分类列表 | 无 |
| POST | `/v1/gallery/images/:id/like` | 点赞 | JWT |
| DELETE | `/v1/gallery/images/:id/like` | 取消点赞 | JWT |
| POST | `/v1/gallery/publish` | 发布到画廊 | JWT |

### 积分模块 (Points)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/points/balance` | 获取积分余额 | JWT |
| GET | `/v1/points/transactions` | 获取交易记录 | JWT |
| POST | `/v1/points/recharge` | 充值积分 | JWT |

### 模板模块 (Templates)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/templates/prompts` | 获取提示词模板 | 无 |
| GET | `/v1/templates/prompts/:id` | 获取模板详情 | 无 |
| POST | `/v1/templates/prompts` | 创建模板 | Admin |
| PUT | `/v1/templates/prompts/:id` | 更新模板 | Admin |
| DELETE | `/v1/templates/prompts/:id` | 删除模板 | Admin |
| GET | `/v1/templates/params` | 获取参数模板 | 无 |
| GET | `/v1/templates/params/:id` | 获取参数模板详情 | 无 |
| POST | `/v1/templates/params` | 创建参数模板 | Admin |
| PUT | `/v1/templates/params/:id` | 更新参数模板 | Admin |
| DELETE | `/v1/templates/params/:id` | 删除参数模板 | Admin |

### 角色模块 (Characters) - 锁脸功能

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/characters` | 获取角色列表 | JWT |
| POST | `/v1/characters` | 创建角色 | JWT |
| GET | `/v1/characters/:id` | 获取角色详情 | JWT |
| PUT | `/v1/characters/:id` | 更新角色 | JWT |
| DELETE | `/v1/characters/:id` | 删除角色 | JWT |
| POST | `/v1/characters/:id/photos/upload` | 上传照片到 R2 | JWT |
| POST | `/v1/characters/:id/photos` | 添加照片 (URL) | JWT |
| GET | `/v1/characters/:id/photos/:photoId` | 获取照片详情 | JWT |
| DELETE | `/v1/characters/:id/photos/:photoId` | 删除照片 | JWT |

### 上传模块 (Upload)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/v1/upload/image` | 上传图片 | JWT |

### 统计模块 (Stats)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/stats/overview` | 用户统计 | JWT |
| GET | `/v1/stats/global` | 全局统计 | 无 |

### 管理模块 (Admin)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/admin/users` | 用户列表 | Admin |
| GET | `/v1/admin/users/:id` | 用户详情 | Admin |
| PUT | `/v1/admin/users/:id` | 更新用户 | Admin |
| DELETE | `/v1/admin/users/:id` | 删除用户 | Admin |
| PUT | `/v1/admin/users/:id/vip` | 设置 VIP | Admin |
| DELETE | `/v1/admin/users/:id/vip` | 取消 VIP | Admin |
| GET | `/v1/admin/stats` | 管理统计 | Admin |

---

## 详细接口文档

### 发送短信验证码

**POST** `/v1/auth/send-code`

发送短信验证码到指定手机号，60秒内不能重复发送。

**请求体：**
```json
{
  "phone": "13800138000"
}
```

**响应（开发模式）：**
```json
{
  "success": true,
  "message": "Verification code sent (mock mode)",
  "code": "123456"
}
```

**响应（生产模式）：**
```json
{
  "success": true,
  "message": "Verification code sent"
}
```

**错误响应：**
```json
{
  "statusCode": 400,
  "message": "Please wait 60 seconds before requesting another code"
}
```

---

### 手机号登录/注册

**POST** `/v1/auth/phone-login`

使用手机号和验证码登录，如果用户不存在则自动注册。

**请求体：**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "nickName": "可选昵称",
  "avatarUrl": "可选头像URL"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d",
  "user": {
    "id": 1,
    "phone": "13800138000",
    "nickName": "用户8000",
    "avatarUrl": null,
    "vipLevel": "NORMAL",
    "pointsBalance": 0,
    "openid": null,
    "createdAt": "2026-02-03T07:38:19.886Z"
  }
}
```

---

### 绑定手机号

**POST** `/v1/auth/bind-phone`

将手机号绑定到当前登录的微信账号。如果手机号已被其他账号使用，会自动合并账号。

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**请求体：**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应：**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "phone": "13800138000",
    "openid": "xxx",
    "vipLevel": "VIP"
  }
}
```

---

### 微信登录

**POST** `/v1/auth/wechat-login`

**请求体：**
```json
{
  "code": "微信登录 code（必填）",
  "phoneCode": "手机号授权 code（可选，新版方式）",
  "encryptedData": "加密数据（可选，旧版方式）",
  "iv": "初始向量（可选，旧版方式）",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像URL"
  }
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d",
  "user": {
    "id": 1,
    "openid": "xxx",
    "unionid": "xxx",
    "phone": "13800138000",
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "vipLevel": "NORMAL",
    "pointsBalance": 0
  }
}
```

---

### 获取用户统计

**GET** `/v1/users/me/stats`

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**响应：**
```json
{
  "user": {
    "id": 1,
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "vipLevel": "VIP",
    "vipExpireAt": "2026-03-01T00:00:00Z",
    "pointsBalance": 100
  },
  "stats": {
    "totalFavorites": 10,
    "totalOrders": 2,
    "totalGenerations": 50,
    "todayGenerations": 3,
    "todayRemaining": 17,
    "dailyLimit": 20
  }
}
```

---

### 获取配额信息

**GET** `/v1/jobs/quota`

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**响应：**
```json
{
  "vipLevel": "VIP",
  "dailyLimit": 20,
  "todayUsed": 5,
  "todayRemaining": 15,
  "totalGenerations": 100
}
```

**每日限额说明：**
- `NORMAL`（普通用户）：2 张/天
- `VIP`：20 张/天
- `SVIP`：100 张/天

---

### 创建生成任务（本地）

**POST** `/v1/jobs`

创建图片生成任务，会自动检查每日配额，并记录到本地数据库。支持锁脸功能。

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**请求体：**
```json
{
  "prompt": "A cute cat",
  "negativePrompt": "ugly, blurry",
  "aspectRatio": "1:1",
  "resolution": "1024x1024",
  "model": "默认模型",
  "mode": "final",
  "characterId": "optional-character-uuid",
  "inputImage": "data:image/png;base64,iVBORw0KGgo..."
}
```

**参数说明：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 生成提示词 |
| negativePrompt | string | 否 | 负面提示词 |
| aspectRatio | string | 否 | 宽高比，如 "1:1", "16:9" |
| resolution | string | 否 | 分辨率，如 "1024x1024" |
| model | string | 否 | 模型名称 |
| mode | string | 否 | 生成模式，"draft" 或 "final"（默认） |
| characterId | string | 否 | 角色 UUID，用于锁脸功能。传入后会自动获取角色照片作为参考图 |
| inputImage | string | 否 | 直接传入参考图片，格式: `data:image/<type>;base64,<data>` |
| params | object | 否 | 其他自定义参数 |

**锁脸功能说明：**
- 传入 `characterId` 时，系统会自动获取该角色的第一张照片作为参考图
- 系统会自动添加锁脸指令到提示词，确保生成的图片保持一致的面部特征
- 也可以直接传入 `inputImage` 字段，使用自定义的参考图片
- 如果同时传入 `characterId` 和 `inputImage`，优先使用 `characterId` 关联的角色照片

**响应：**
```json
{
  "jobId": "cmkuz35wf00034rk15ycgzvce",
  "status": "QUEUED",
  "generationId": 1
}
```

**错误响应（超出配额）：**
```json
{
  "statusCode": 403,
  "message": "Daily limit reached (20/20)"
}
```

**错误响应（角色无照片）：**
```json
{
  "statusCode": 400,
  "message": "Selected character has no photos. Please upload photos first."
}
```

---

### 生成图片（代理到第三方）

**POST** `/v1/proxy/images/generate`

直接代理到第三方 AI 服务，不记录到本地数据库。

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**请求体：**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "mode": "final",
  "resolution": "2K",
  "aspectRatio": "16:9"
}
```

**响应：**
```json
{
  "jobId": "cmkuz35wf00034rk15ycgzvce",
  "status": "QUEUED"
}
```

---

### 获取任务列表（代理）

**GET** `/v1/proxy/jobs`

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query 参数：**
- `limit` - 每页数量（默认 20）
- `cursor` - 分页游标

**响应：**
```json
{
  "items": [
    {
      "id": "cmkuz35wf00034rk15ycgzvce",
      "status": "SUCCEEDED",
      "prompt": "A cute cat",
      "mode": "final",
      "resultUrls": ["https://assets.xxx.com/xxx.png"],
      "createdAt": "2026-02-04T07:15:39.632Z"
    }
  ],
  "nextCursor": "xxx",
  "hasMore": true
}
```

---

### 创建角色

**POST** `/v1/characters`

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
```

**请求体：**
```json
{
  "name": "角色名称",
  "description": "角色描述（可选）"
}
```

**响应：**
```json
{
  "success": true,
  "character": {
    "id": 1,
    "uuid": "15797c59-1d08-4edb-9482-8757510c463f",
    "name": "角色名称",
    "description": "角色描述",
    "photos": [],
    "createdAt": "2026-02-01T23:48:06.544Z"
  }
}
```

---

### 上传角色照片到 R2

**POST** `/v1/characters/:characterId/photos/upload`

**Headers：**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**请求体：**
```json
{
  "thumbnailData": "base64编码的缩略图（不含data:前缀）",
  "originalData": "base64编码的原图（可选，不传则复用缩略图）",
  "mimeType": "image/jpeg"
}
```

**响应：**
```json
{
  "success": true,
  "photo": {
    "uuid": "photo-uuid",
    "thumbnailUrl": "https://assets.xxx.com/characters/1/xxx/xxx_thumb.jpg",
    "originalUrl": "https://assets.xxx.com/characters/1/xxx/xxx_original.jpg",
    "mimeType": "image/jpeg"
  }
}
```

---

### 管理员设置 VIP

**PUT** `/v1/admin/users/:userId/vip`

**Headers：**
```
X-Admin-Key: <ADMIN_API_KEY>
Content-Type: application/json
```

**请求体（方式一：指定天数）：**
```json
{
  "vipLevel": "VIP",
  "days": 30
}
```

**请求体（方式二：指定到期时间）：**
```json
{
  "vipLevel": "SVIP",
  "vipExpireAt": "2026-12-31T23:59:59Z"
}
```

**VIP 等级：**
- `NORMAL` - 普通用户
- `VIP` - VIP 会员
- `SVIP` - 超级 VIP

**响应：**
```json
{
  "user": {
    "id": 1,
    "vipLevel": "VIP",
    "vipExpireAt": "2026-03-05T07:33:41.010Z"
  },
  "message": "VIP updated successfully"
}
```

---

### 管理员统计

**GET** `/v1/admin/stats`

**Headers：**
```
X-Admin-Key: <ADMIN_API_KEY>
```

**响应：**
```json
{
  "totalUsers": 100,
  "vipUsers": 20,
  "freeUsers": 80,
  "totalOrders": 50,
  "todayNewUsers": 5
}
```

---

## 错误响应

所有错误响应格式：

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request"
}
```

**常见状态码：**
- `400` - 请求参数错误
- `401` - 未认证或认证失败
- `403` - 无权限或超出配额
- `404` - 资源不存在
- `429` - 请求过于频繁
- `500` - 服务器内部错误

---

## Swagger 文档

服务运行后可访问在线 API 文档：

**URL:** http://localhost:3000/api/docs

---

## 环境变量

```env
# 管理员 API Key
ADMIN_API_KEY=admin_secret_key_change_in_production

# JWT 密钥
JWT_SECRET=your-jwt-secret

# 第三方 AI 服务
THIRD_PARTY_API_BASE_URL=http://localhost:3001
THIRD_PARTY_API_KEY=img_test_dev_123456789

# R2 存储
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=dream-wechat-assets
R2_PUBLIC_BASE_URL=https://assets.xxx.com

# 每日生成限额
GENERATION_DAILY_LIMIT_NORMAL=2
GENERATION_DAILY_LIMIT_VIP=20
GENERATION_DAILY_LIMIT_SVIP=100

# 短信服务
SMS_MODE=mock
ALIYUN_SMS_ACCESS_KEY_ID=
ALIYUN_SMS_ACCESS_KEY_SECRET=
ALIYUN_SMS_SIGN_NAME=
ALIYUN_SMS_TEMPLATE_CODE=
```
