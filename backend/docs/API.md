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
| POST | `/v1/auth/refresh-token` | 刷新 Token | JWT |
| GET | `/v1/auth/userinfo` | 获取用户信息 | JWT |
| GET | `/v1/auth/check` | 检查登录状态 | JWT |

### 用户模块 (Users)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/v1/users/me` | 获取当前用户 | JWT |
| GET | `/v1/users/me/stats` | 获取用户统计 | JWT |

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

### 代理模块 (Proxy) - 图片生成

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/v1/proxy/images/generate` | 生成图片 | JWT |
| GET | `/v1/proxy/jobs` | 获取任务列表 | JWT |
| GET | `/v1/proxy/jobs/:jobId` | 获取任务详情 | JWT |
| DELETE | `/v1/proxy/jobs/:jobId` | 取消任务 | JWT |

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

### 微信登录

**POST** `/v1/auth/wechat-login`

**请求体：**
```json
{
  "code": "微信登录 code",
  "encryptedData": "加密数据（可选）",
  "iv": "初始向量（可选）",
  "userInfo": {
    "nickName": "昵称",
    "avatarUrl": "头像URL"
  }
}
```

**响应：**
```json
{
  "accessToken": "jwt_token_here",
  "user": {
    "id": 1,
    "openid": "xxx",
    "nickName": "用户昵称",
    "vipLevel": "NORMAL"
  }
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

### 管理员取消 VIP

**DELETE** `/v1/admin/users/:userId/vip`

**Headers：**
```
X-Admin-Key: <ADMIN_API_KEY>
```

**响应：**
```json
{
  "user": {
    "id": 1,
    "vipLevel": "NORMAL",
    "vipExpireAt": null
  },
  "message": "VIP cancelled"
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

### 创建提示词模板

**POST** `/v1/templates/prompts`

**Headers：**
```
X-Admin-Key: <ADMIN_API_KEY>
Content-Type: application/json
```

**请求体：**
```json
{
  "templateId": "template-001",
  "title": "可爱猫咪",
  "description": "生成可爱的猫咪图片",
  "prompt": "A cute fluffy cat with big eyes...",
  "category": "animals",
  "thumbnailUrl": "https://xxx/thumb.jpg",
  "previewImages": ["https://xxx/1.jpg", "https://xxx/2.jpg"],
  "isHot": true
}
```

---

### 更新模板

**PUT** `/v1/templates/prompts/:templateId`

**Headers：**
```
X-Admin-Key: <ADMIN_API_KEY>
Content-Type: application/json
```

**请求体（所有字段可选）：**
```json
{
  "title": "新标题",
  "prompt": "新提示词",
  "isHot": false
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
- `403` - 无权限
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

# R2 存储
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=dream-wechat-assets
R2_PUBLIC_BASE_URL=https://assets.xxx.com
```
