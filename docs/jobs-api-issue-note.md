# Jobs API 接口使用说明

## 问题：GET /v1/jobs/:jobId 返回空响应

### 现象

```javascript
// 前端调用
GET /v1/jobs/30

// 响应
HTTP/2 200
Content-Length: 0
// 空响应体
```

前端日志：
```
[Response] https://dream-api.newpai.cn/v1/jobs/30 200
[ImageDetail] 接口返回数据: ""
[ImageDetail] 解析的图片URL: 
```

### 原因分析

#### 接口设计

`GET /v1/jobs/:jobId` 期望的参数是 `job_id`（第三方 API 返回的字符串 ID），而不是数据库自增 ID。

#### 数据库字段说明

```javascript
{
  "id": 30,                    // ❌ 数据库自增 ID（generation id）
  "job_id": "cmmkbwx3m001zs689siqfmgi8",  // ✅ 第三方任务 ID（job_id）
  "status": "COMPLETED",
  "image_url": "https://...",
  ...
}
```

#### 错误流程

1. 前端使用 `id=30` 调用接口
2. 后端将 `jobId="30"` 转发给第三方 API
3. 第三方 API 找不到 job_id="30" 的任务
4. 第三方 API 返回空响应
5. 后端返回空响应给前端

### 解决方案

#### ✅ 方案 1：前端修复（推荐）

前端应使用 `job_id` 字段而不是 `id`：

```javascript
// ❌ 错误
const response = await fetch(`/v1/jobs/${generation.id}`);

// ✅ 正确
const response = await fetch(`/v1/jobs/${generation.jobId}`);
```

#### 示例代码

**从任务列表获取数据：**

```javascript
// GET /v1/jobs 返回
{
  "jobs": [
    {
      "id": 30,
      "jobId": "cmmkbwx3m001zs689siqfmgi8",  // 使用这个字段
      "status": "COMPLETED",
      "imageUrl": "https://...",
      ...
    }
  ]
}

// 查询详情
const job = jobs[0];
const response = await fetch(`/v1/jobs/${job.jobId}`);  // 使用 jobId
```

#### 方案 2：后端增强（可选）

如果需要支持通过 generation id 查询，可以添加新接口：

**后端代码：**

```typescript
// jobs.controller.ts
@Get('detail/:id')
@ApiOperation({ summary: 'Get job detail by generation ID' })
async getJobById(
  @Request() req: any,
  @Param('id') id: string,
): Promise<any> {
  const generation = await this.generationsService.findById(parseInt(id));
  if (!generation) {
    throw new NotFoundException('Generation not found');
  }
  return await this.jobsService.getJob(req.user.userId, generation.jobId);
}
```

**前端调用：**

```javascript
// 使用新接口
const response = await fetch(`/v1/jobs/detail/${generation.id}`);
```

### 验证

#### 正确的调用示例

```bash
curl -X GET "https://dream-api.newpai.cn/v1/jobs/cmmkbwx3m001zs689siqfmgi8" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应：**

```json
{
  "jobId": "cmmkbwx3m001zs689siqfmgi8",
  "status": "SUCCEEDED",
  "resultUrls": [
    "https://assets.newpai.cn/cmmkbwx3m001zs689siqfmgi8/1773130308480-0.png"
  ],
  "error": null,
  "createdAt": "2026-03-10T08:09:16.690Z",
  "updatedAt": "2026-03-10T08:11:54.256Z"
}
```

### 字段对照表

| 字段名 | 类型 | 说明 | 示例 | 用途 |
|--------|------|------|------|------|
| `id` | number | 数据库自增 ID | 30 | 内部数据库主键，不用于 API 调用 |
| `jobId` | string | 第三方任务 ID | "cmmkbwx3m001zs689siqfmgi8" | API 查询、状态轮询 |

### 相关接口

- `POST /v1/jobs` - 创建任务，返回 `jobId`
- `GET /v1/jobs` - 获取任务列表，返回包含 `jobId` 的数组
- `GET /v1/jobs/:jobId` - 获取任务详情，**使用 `jobId` 而不是 `id`**
- `DELETE /v1/jobs/:jobId` - 取消任务，**使用 `jobId` 而不是 `id`**

### 最后更新

2026-03-11
