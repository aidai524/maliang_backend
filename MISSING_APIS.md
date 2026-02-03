# 缺失的API接口清单

## 📊 概述

根据现有API文档和《DEVELOPMENT_PLAN.md》中的功能需求，以下是开发小程序功能**必须补充**的API接口。

---

## 🔐 一、用户认证模块（必须）

### 1.1 微信登录
**优先级**：P0

**Endpoint:** `POST /v1/auth/wechat-login`

**认证:** 不需要

**请求体:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `code` | string | 是 | 微信登录凭证 |
| `userInfo` | object | 否 | 用户信息 { nickName, avatarUrl } |

**请求示例:**

```json
{
  "code": "081aBcDe123456",
  "userInfo": {
    "nickName": "张三",
    "avatarUrl": "https://..."
  }
}
```

**响应示例:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_12345",
    "openid": "oXXX-xxx-xxx",
    "nickName": "张三",
    "avatarUrl": "https://...",
    "vipLevel": "NORMAL",
    "vipExpireAt": null
  }
}
```

**状态码:**
- `200 OK` - 登录成功
- `400 Bad Request` - 参数无效
- `401 Unauthorized` - code无效或已过期

---

### 1.2 获取用户信息
**优先级**：P0

**Endpoint:** `GET /v1/auth/userinfo`

**认证:** 需要 (Bearer Token)

**请求示例:**

```bash
curl http://localhost:3001/v1/auth/userinfo \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例:**

```json
{
  "user": {
    "id": "user_12345",
    "openid": "oXXX-xxx-xxx",
    "nickName": "张三",
    "avatarUrl": "https://...",
    "vipLevel": "VIP",
    "vipExpireAt": "2026-02-28T00:00:00.000Z",
    "stats": {
      "totalGenerated": 156,
      "successRate": 0.95,
      "monthGenerated": 23
    }
  }
}
```

**状态码:**
- `200 OK` - 成功
- `401 Unauthorized` - Token无效

---

### 1.3 刷新Token（可选）
**优先级**：P1

**Endpoint:** `POST /v1/auth/refresh-token`

**认证:** 不需要

**请求体:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应示例:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 1.4 退出登录（可选，前端直接清除Token即可）
**优先级**：P2

**Endpoint:** `POST /v1/auth/logout`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "message": "退出成功"
}
```

---

## 💎 二、会员系统模块（必须）

### 2.1 获取会员信息
**优先级**：P0

**Endpoint:** `GET /v1/vip/info`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "vipLevel": "VIP",
  "vipExpireAt": "2026-02-28T00:00:00.000Z",
  "remainingDays": 30,
  "quota": {
    "dailyGenerations": {
      "used": 3,
      "limit": 5
    },
    "monthlyGenerations": {
      "used": 23,
      "limit": 100
    },
    "totalRemaining": 477
  },
  "benefits": [
    "unlimited_generation",
    "high_quality_mode",
    "4k_resolution",
    "priority_queue",
    "permanent_history"
  ]
}
```

---

### 2.2 获取会员套餐列表
**优先级**：P0

**Endpoint:** `GET /v1/vip/plans`

**认证:** 不需要

**响应示例:**

```json
{
  "plans": [
    {
      "id": "vip_month",
      "name": "月度会员",
      "duration": 30,
      "originalPrice": 2999,
      "currentPrice": 1999,
      "benefits": [
        "每日无限生成",
        "高质量模式",
        "2K分辨率",
        "历史记录保留60天"
      ]
    },
    {
      "id": "vip_year",
      "name": "年度会员",
      "duration": 365,
      "originalPrice": 29990,
      "currentPrice": 19990,
      "benefits": [
        "每日无限生成",
        "高质量模式",
        "4K分辨率",
        "历史记录永久保留",
        "优先生成队列",
        "专属客服"
      ],
      "popular": true
    },
    {
      "id": "svip_lifetime",
      "name": "终身会员",
      "duration": 36500,
      "originalPrice": 299900,
      "currentPrice": 199900,
      "benefits": [
        "所有VIP权益",
        "4K分辨率无限使用",
        "专属会员标识",
        "优先体验新功能"
      ]
    }
  ]
}
```

---

### 2.3 创建购买订单
**优先级**：P0

**Endpoint:** `POST /v1/vip/purchase`

**认证:** 需要 (Bearer Token)

**请求体:**

```json
{
  "planId": "vip_month",
  "paymentMethod": "wechat"
}
```

**响应示例:**

```json
{
  "orderId": "order_20260129_123456",
  "amount": 1999,
  "wxPayParams": {
    "timeStamp": "1640784000",
    "nonceStr": "abc123xyz",
    "package": "prepay_id=wx29...",
    "signType": "MD5",
    "paySign": "C380BEC2BFD727A4B6845133519F3AD6"
  }
}
```

**状态码:**
- `200 OK` - 订单创建成功
- `400 Bad Request` - 套餐不存在或已购买
- `401 Unauthorized` - Token无效

---

### 2.4 查询订单状态
**优先级**：P0

**Endpoint:** `GET /v1/vip/orders/{orderId}`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "orderId": "order_20260129_123456",
  "status": "PAID",
  "plan": {
    "id": "vip_month",
    "name": "月度会员",
    "duration": 30
  },
  "amount": 1999,
  "paidAt": "2026-01-29T12:00:00.000Z",
  "vipExpireAt": "2026-02-28T00:00:00.000Z"
}
```

**订单状态:**
- `PENDING` - 待支付
- `PAID` - 已支付
- `CANCELLED` - 已取消
- `REFUNDED` - 已退款

---

### 2.5 支付回调（后端处理，小程序不直接调用）
**优先级**：P0

**Endpoint:** `POST /v1/vip/payment-callback`

**认证:** 签名验证（微信支付签名）

**请求体:** 微信支付回调数据

**响应示例:**

```json
{
  "code": "SUCCESS",
  "message": "支付成功"
}
```

---

### 2.6 获取我的订单列表
**优先级**：P1

**Endpoint:** `GET /v1/vip/orders`

**认证:** 需要 (Bearer Token)

**Query参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `status` | string | 过滤状态：`PENDING`, `PAID`, `CANCELLED`, `REFUNDED` |
| `limit` | integer | 每页数量，默认 20 |
| `cursor` | string | 分页游标 |

**响应示例:**

```json
{
  "items": [
    {
      "orderId": "order_20260129_123456",
      "status": "PAID",
      "planName": "月度会员",
      "amount": 1999,
      "createdAt": "2026-01-29T12:00:00.000Z"
    }
  ],
  "hasMore": false
}
```

---

## 💰 三、积分系统模块（可选）

### 3.1 获取积分余额
**优先级**：P1

**Endpoint:** `GET /v1/points/balance`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "balance": 5200,
  "totalEarned": 10000,
  "totalSpent": 4800
}
```

---

### 3.2 积分充值
**优先级**：P1

**Endpoint:** `POST /v1/points/recharge`

**认证:** 需要 (Bearer Token)

**请求体:**

```json
{
  "amount": 1000,
  "paymentMethod": "wechat"
}
```

**响应示例:**

```json
{
  "orderId": "order_points_20260129_123456",
  "amount": 1000,
  "wxPayParams": {
    "timeStamp": "1640784000",
    "nonceStr": "abc123xyz",
    "package": "prepay_id=wx29...",
    "signType": "MD5",
    "paySign": "C380BEC2BFD727A4B6845133519F3AD6"
  }
}
```

---

### 3.3 积分交易记录
**优先级**：P1

**Endpoint:** `GET /v1/points/transactions`

**认证:** 需要 (Bearer Token)

**Query参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 过滤类型：`EARN`, `SPEND`, `REFUND` |
| `limit` | integer | 每页数量，默认 20 |
| `cursor` | string | 分页游标 |

**响应示例:**

```json
{
  "items": [
    {
      "id": "tx_123456",
      "type": "SPEND",
      "amount": 10,
      "description": "生成图片",
      "balanceAfter": 5200,
      "createdAt": "2026-01-29T12:00:00.000Z"
    }
  ],
  "hasMore": false
}
```

---

## 🖼️ 四、图片库/广场模块（推荐）

### 4.1 获取公开图片列表
**优先级**：P1

**Endpoint:** `GET /v1/gallery/images`

**认证:** 不需要

**Query参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `category` | string | 分类ID，可选 |
| `tag` | string | 标签，可选 |
| `limit` | integer | 每页数量，默认 20 |
| `cursor` | string | 分页游标 |

**响应示例:**

```json
{
  "items": [
    {
      "id": "img_123456",
      "imageUrl": "https://...",
      "thumbnailUrl": "https://...",
      "prompt": "A beautiful sunset over mountains",
      "category": {
        "id": "nature",
        "name": "自然风景"
      },
      "likes": 156,
      "isLiked": false,
      "author": {
        "id": "user_123",
        "nickName": "AI艺术家",
        "avatarUrl": "https://..."
      },
      "createdAt": "2026-01-28T10:00:00.000Z"
    }
  ],
  "hasMore": true,
  "nextCursor": "eyJmaWVsZCI6ImNyZWF0ZWRBdCIsImRpcmVjdGlvbiI6Im5leHQifQ"
}
```

---

### 4.2 获取分类列表
**优先级**：P1

**Endpoint:** `GET /v1/gallery/categories`

**认证:** 不需要

**响应示例:**

```json
{
  "categories": [
    {
      "id": "all",
      "name": "全部",
      "icon": "grid"
    },
    {
      "id": "portrait",
      "name": "人物肖像",
      "icon": "user"
    },
    {
      "id": "landscape",
      "name": "风景",
      "icon": "image"
    },
    {
      "id": "cartoon",
      "name": "卡通动漫",
      "icon": "smile"
    },
    {
      "id": "abstract",
      "name": "抽象艺术",
      "icon": "apps"
    }
  ]
}
```

---

### 4.3 点赞/取消点赞
**优先级**：P1

**Endpoint:** `POST /v1/gallery/images/{imageId}/like`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "liked": true,
  "totalLikes": 157
}
```

**Endpoint:** `DELETE /v1/gallery/images/{imageId}/like`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "liked": false,
  "totalLikes": 156
}
```

---

### 4.4 发布图片到广场（可选）
**优先级**：P2

**Endpoint:** `POST /v1/gallery/publish`

**认证:** 需要 (Bearer Token)

**请求体:**

```json
{
  "jobId": "cmkuz35wf00034rk15ycgzvce",
  "categoryId": "nature",
  "tags": ["sunset", "mountains", "beautiful"]
}
```

**响应示例:**

```json
{
  "imageId": "img_123456",
  "publishedAt": "2026-01-29T12:00:00.000Z"
}
```

---

## ⭐ 五、收藏系统模块（推荐）

### 5.1 添加收藏
**优先级**：P1

**Endpoint:** `POST /v1/favorites`

**认证:** 需要 (Bearer Token)

**请求体:**

```json
{
  "type": "image",
  "resourceId": "img_123456"
}
```

**响应示例:**

```json
{
  "favoriteId": "fav_123456",
  "createdAt": "2026-01-29T12:00:00.000Z"
}
```

---

### 5.2 取消收藏
**优先级**：P1

**Endpoint:** `DELETE /v1/favorites/{favoriteId}`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "message": "取消成功"
}
```

---

### 5.3 获取我的收藏列表
**优先级**：P1

**Endpoint:** `GET /v1/favorites`

**认证:** 需要 (Bearer Token)

**Query参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 过滤类型：`image`, `prompt` |
| `limit` | integer | 每页数量，默认 20 |
| `cursor` | string | 分页游标 |

**响应示例:**

```json
{
  "items": [
    {
      "favoriteId": "fav_123456",
      "type": "image",
      "resourceId": "img_123456",
      "image": {
        "id": "img_123456",
        "imageUrl": "https://...",
        "thumbnailUrl": "https://...",
        "prompt": "A beautiful sunset over mountains",
        "createdAt": "2026-01-28T10:00:00.000Z"
      },
      "favoritedAt": "2026-01-29T12:00:00.000Z"
    }
  ],
  "hasMore": true
}
```

---

### 5.4 检查是否已收藏
**优先级**：P1

**Endpoint:** `GET /v1/favorites/check`

**认证:** 需要 (Bearer Token)

**Query参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 类型：`image`, `prompt` |
| `resourceId` | string | 资源ID |

**响应示例:**

```json
{
  "isFavorited": true,
  "favoriteId": "fav_123456"
}
```

---

## 📝 六、提示词模板模块（可选）

### 6.1 获取提示词模板列表
**优先级**：P1

**Endpoint:** `GET /v1/templates/prompts`

**认证:** 不需要

**Query参数:**

| 参数 | 类型 | 说明 |
|------|------|------|
| `category` | string | 分类ID，可选 |
| `trending` | boolean | 是否只返回热门模板 |

**响应示例:**

```json
{
  "items": [
    {
      "id": "template_001",
      "title": "赛博朋克风格",
      "prompt": "A futuristic cyberpunk cityscape, neon lights, rain, 8K, ultra detailed",
      "category": "style",
      "thumbnailUrl": "https://...",
      "usageCount": 1234,
      "isHot": true
    },
    {
      "id": "template_002",
      "title": "吉卜力风格",
      "prompt": "Studio Ghibli style, beautiful landscape, hand drawn, vibrant colors",
      "category": "style",
      "thumbnailUrl": "https://...",
      "usageCount": 987,
      "isHot": true
    }
  ]
}
```

---

### 6.2 获取参数模板列表
**优先级**：P1

**Endpoint:** `GET /v1/templates/params`

**认证:** 不需要

**响应示例:**

```json
{
  "items": [
    {
      "id": "param_001",
      "title": "快速预览",
      "mode": "draft",
      "resolution": null,
      "aspectRatio": "1:1",
      "sampleCount": 1
    },
    {
      "id": "param_002",
      "title": "高清横屏",
      "mode": "final",
      "resolution": "2K",
      "aspectRatio": "16:9",
      "sampleCount": 1
    },
    {
      "id": "param_003",
      "title": "竖屏手机",
      "mode": "final",
      "resolution": "2K",
      "aspectRatio": "9:16",
      "sampleCount": 1
    },
    {
      "id": "param_004",
      "title": "超高清壁纸",
      "mode": "final",
      "resolution": "4K",
      "aspectRatio": "16:9",
      "sampleCount": 1
    }
  ]
}
```

---

## 📊 七、统计模块（可选）

### 7.1 获取用户生成统计
**优先级**：P1

**Endpoint:** `GET /v1/stats/overview`

**认证:** 需要 (Bearer Token)

**响应示例:**

```json
{
  "totalGenerated": 156,
  "successRate": 0.95,
  "favoriteCount": 23,
  "weeklyGenerated": 15,
  "monthlyGenerated": 67,
  "topCategories": [
    { "name": "风景", "count": 45 },
    { "name": "人物", "count": 32 },
    { "name": "卡通", "count": 28 }
  ]
}
```

---

## 📋 八、按优先级汇总

### P0 - 必须实现（MVP必需）

| 接口 | 模块 | 说明 |
|------|------|------|
| POST /v1/auth/wechat-login | 用户认证 | 微信登录 |
| GET /v1/auth/userinfo | 用户认证 | 获取用户信息 |
| GET /v1/vip/info | 会员系统 | 获取会员信息 |
| GET /v1/vip/plans | 会员系统 | 获取套餐列表 |
| POST /v1/vip/purchase | 会员系统 | 创建购买订单 |
| GET /v1/vip/orders/{orderId} | 会员系统 | 查询订单状态 |

**共6个接口**

---

### P1 - 推荐实现（完整功能）

| 接口 | 模块 | 说明 |
|------|------|------|
| POST /v1/auth/refresh-token | 用户认证 | 刷新Token |
| GET /v1/vip/orders | 会员系统 | 订单列表 |
| GET /v1/points/balance | 积分系统 | 积分余额 |
| POST /v1/points/recharge | 积分系统 | 积分充值 |
| GET /v1/points/transactions | 积分系统 | 交易记录 |
| GET /v1/gallery/images | 图片库 | 公开图片列表 |
| GET /v1/gallery/categories | 图片库 | 分类列表 |
| POST /v1/gallery/images/{imageId}/like | 图片库 | 点赞 |
| DELETE /v1/gallery/images/{imageId}/like | 图片库 | 取消点赞 |
| POST /v1/favorites | 收藏系统 | 添加收藏 |
| DELETE /v1/favorites/{favoriteId} | 收藏系统 | 取消收藏 |
| GET /v1/favorites | 收藏系统 | 收藏列表 |
| GET /v1/favorites/check | 收藏系统 | 检查收藏状态 |
| GET /v1/templates/prompts | 提示词模板 | 提示词模板列表 |
| GET /v1/templates/params | 提示词模板 | 参数模板列表 |
| GET /v1/stats/overview | 统计 | 生成统计 |

**共16个接口**

---

### P2 - 可选实现（增强体验）

| 接口 | 模块 | 说明 |
|------|------|------|
| POST /v1/auth/logout | 用户认证 | 退出登录 |
| POST /v1/gallery/publish | 图片库 | 发布图片到广场 |

**共2个接口**

---

## 🎯 九、实施建议

### 阶段1：MVP开发（先实现P0接口）

**必需接口（6个）：**
- 用户认证：登录、获取用户信息
- 会员系统：会员信息、套餐列表、购买订单、订单查询

**工期估算**：3-5天

---

### 阶段2：完整功能（实现P0 + P1接口）

**新增接口（16个）：**
- 收藏系统
- 图片库/广场
- 积分系统
- 提示词模板
- 统计功能

**工期估算**：7-10天

---

### 阶段3：增强体验（实现P2接口）

**新增接口（2个）：**
- 退出登录
- 发布图片

**工期估算**：1-2天

---

**总计需要补充：24个API接口**

---

## 📚 附录：错误码扩展

建议在现有错误码基础上增加：

| 错误码 | 说明 | HTTP状态 |
|--------|------|-----------|
| `USER_NOT_FOUND` | 用户不存在 | 404 |
| `USER_ALREADY_EXISTS` | 用户已存在 | 409 |
| `VIP_ALREADY_ACTIVE` | 会员已激活，无法重复购买 | 400 |
| `INSUFFICIENT_POINTS` | 积分不足 | 400 |
| `FAVORITE_NOT_FOUND` | 收藏记录不存在 | 404 |
| `PLAN_NOT_FOUND` | 套餐不存在 | 404 |
| `ORDER_NOT_FOUND` | 订单不存在 | 404 |
| `ORDER_EXPIRED` | 订单已过期 | 400 |
| `PAYMENT_FAILED` | 支付失败 | 400 |

---

**文档版本**：v1.0
**创建日期**：2026-01-29
**最后更新**：2026-01-29
