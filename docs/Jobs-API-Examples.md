# Jobs API 实际请求示例

完整的 POST /v1/jobs 接口使用示例和参数说明。

---

## 📝 快速开始

### 最简单的请求（只需 prompt）

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over the ocean"
  }'
```

**说明**：所有其他参数都有默认值，最少只需要传 prompt。

---

## 🎯 常用示例

### 1. 基础参数

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A professional portrait photo",
    "negativePrompt": "ugly, blurry, low quality",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "16:9"
  }'
```

### 2. 锁脸功能（使用 characterId）

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A portrait in traditional Chinese dress",
    "negativePrompt": "modern clothing, glasses",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "1:1",
    "characterId": 1
  }'
```

**说明**：characterId 会自动从数据库获取角色的照片作为参考图。

### 3. 锁脸功能（直接传 base64 图片）

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A portrait photo with studio lighting",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "1:1",
    "inputImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
  }'
```

**说明**：inputImage 必须是 base64 格式，带 data URI 前缀。

### 4. 带模板标题和描述

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A professional portrait photo",
    "templateTitle": "专业人像模板",
    "templateDescription": "适用于证件照、职业照等专业场景",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "1:1"
  }'
```

**说明**：templateTitle 和 templateDescription 用于标记任务的模板信息，在任务列表中显示。

### 5. 完整参数

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A stunning mountain landscape at sunset",
    "negativePrompt": "people, animals, text, watermark",
    "templateTitle": "风景摄影模板",
    "templateDescription": "适用于自然风景、户外摄影",
    "model": "gemini-3-pro-image-preview",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "16:9",
    "params": {
      "endpoint": "yunwu",
      "sampleCount": 1
    }
  }'
```

---

## 📋 参数详细说明

### 核心参数（前端 → 后端）

| 参数名 | 类型 | 必填 | 说明 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| `prompt` | string | ✅ | 生成提示词 | - | "A beautiful sunset" |
| `negativePrompt` | string | ❌ | 负面提示词 | - | "ugly, blurry" |
| `templateTitle` | string | ❌ | 模板标题 | - | "专业人像模板" |
| `templateDescription` | string | ❌ | 模板描述 | - | "适用于证件照场景" |
| `model` | string | ❌ | 模型名称 | gemini-3-pro-image-preview | "gemini-2.5-flash-image" |
| `mode` | string | ❌ | 生成模式 | "final" | "draft" 或 "final" |
| `resolution` | string | ❌ | 分辨率 | "2K" | "1K", "2K", "4K" |
| `aspectRatio` | string | ❌ | 宽高比 | "1:1" | "16:9", "9:16" |
| `characterId` | string/number | ❌ | 角色 ID（锁脸） | - | 1 或 "uuid" |
| `inputImage` | string | ❌ | 参考图片（base64） | - | "data:image/jpeg;base64,..." |
| `params` | object | ❌ | 其他参数 | {} | {"endpoint": "yunwu"} |

---

## 🎨 参数可选值

### mode（生成模式）

| 值 | 说明 | 速度 | 质量 |
|---|------|------|------|
| `"draft"` | 快速生成 | 快 | 较低 |
| `"final"` | 高质量生成 | 慢 | 高 |

### resolution（分辨率）

| 值 | 像素 | 说明 |
|---|------|------|
| `"1K"` | 1024 | 快速生成 |
| `"2K"` | 2048 | 推荐 |
| `"4K"` | 4096 | 高清（可能超时） |

### aspectRatio（宽高比）

| 值 | 说明 | 适用场景 |
|---|------|----------|
| `"1:1"` | 正方形 | 头像、产品图 |
| `"9:16"` | 竖屏 | 手机壁纸 |
| `"16:9"` | 横屏 | 电脑壁纸、横幅 |
| `"3:4"` | 竖版照片 | 人像摄影 |
| `"4:3"` | 标准比例 | 传统照片 |
| `"3:2"` | 照片比例 | 摄影作品 |
| `"2:3"` | 竖版照片 | 海报 |
| `"5:4"` | 接近正方形 | 社交媒体 |
| `"4:5"` | 竖版接近正方形 | Instagram |
| `"21:9"` | 超宽屏 | 电影风格 |

### model（模型）

| 值 | 说明 | 推荐度 |
|---|------|--------|
| `"gemini-3-pro-image-preview"` | 最新模型，支持 4K | ⭐⭐⭐⭐⭐ |
| `"gemini-2.5-flash-image"` | 快速模型 | ⭐⭐⭐⭐ |
| `"gemini-2.0-flash-exp-image-generation"` | 实验模型 | ⭐⭐⭐ |

### params.endpoint（服务端点）

| 值 | 说明 | 稳定性 | 速度 |
|---|------|--------|------|
| `"yunwu"` | 云雾 API（默认） | ⭐⭐⭐⭐⭐ | 快 |
| `"official"` | Google 官方 API | ⭐⭐⭐ | 中 |

---

## 📦 响应格式

### 创建任务成功响应

```json
{
  "jobId": "cmmixxxxxxx",
  "status": "QUEUED",
  "generationId": 123
}
```

### 任务列表响应

```json
{
  "jobs": [
    {
      "id": 123,
      "jobId": "cmmixxxxxxx",
      "templateTitle": "专业人像模板",
      "templateDescription": "适用于证件照、职业照等专业场景",
      "status": "SUCCEEDED",
      "imageUrl": "https://assets.newpai.cn/xxx/image.png",
      "thumbnailUrl": "https://assets.newpai.cn/xxx/thumb.png",
      "createdAt": "2026-03-09T10:00:00.000Z",
      "completedAt": "2026-03-09T10:02:30.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

**注意**：任务列表响应中不包含 `prompt` 字段，只包含 `templateTitle` 和 `templateDescription`。

### 错误响应（配额不足）

```json
{
  "statusCode": 403,
  "message": "Daily generation quota exceeded. Please upgrade to VIP for more generations."
}
```

### 错误响应（角色无照片）

```json
{
  "statusCode": 400,
  "message": "Selected character has no photos. Please upload photos first."
}
```

---

## 🔧 完整测试脚本

### Bash 脚本

```bash
#!/bin/bash

# 配置
TOKEN="YOUR_JWT_TOKEN"
BASE_URL="https://dream-api.newpai.cn"

echo "=== 测试 1: 最简单请求 ==="
curl -s -X POST ${BASE_URL}/v1/jobs \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cute cat"}' | jq .

echo ""
echo "=== 测试 2: 常用参数 ==="
curl -s -X POST ${BASE_URL}/v1/jobs \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over the ocean",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "16:9"
  }' | jq .

echo ""
echo "=== 测试 3: 完整参数 ==="
curl -s -X POST ${BASE_URL}/v1/jobs \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A professional portrait photo",
    "negativePrompt": "ugly, blurry, low quality",
    "model": "gemini-3-pro-image-preview",
    "mode": "final",
    "resolution": "2K",
    "aspectRatio": "1:1",
    "params": {
      "endpoint": "yunwu"
    }
  }' | jq .
```

### Python 示例

```python
import requests
import time

# 配置
TOKEN = "YOUR_JWT_TOKEN"
BASE_URL = "https://dream-api.newpai.cn"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# 创建任务
response = requests.post(
    f"{BASE_URL}/v1/jobs",
    headers=headers,
    json={
        "prompt": "A beautiful sunset over the ocean",
        "mode": "final",
        "resolution": "2K",
        "aspectRatio": "16:9"
    }
)

job = response.json()
print(f"Job ID: {job['jobId']}")
print(f"Status: {job['status']}")

# 轮询查询状态
job_id = job['jobId']
while True:
    response = requests.get(
        f"{BASE_URL}/v1/jobs/{job_id}",
        headers=headers
    )
    result = response.json()
    status = result.get('status')
    print(f"Status: {status}")
    
    if status in ['SUCCEEDED', 'FAILED']:
        if status == 'SUCCEEDED':
            print(f"\n✅ 生成成功!")
            print(f"图片URL: {result['resultUrls'][0]}")
        else:
            print(f"\n❌ 生成失败: {result.get('error')}")
        break
    
    time.sleep(10)
```

### JavaScript 示例

```javascript
const TOKEN = 'YOUR_JWT_TOKEN';
const BASE_URL = 'https://dream-api.newpai.cn';

// 创建任务
async function createJob() {
  const response = await fetch(`${BASE_URL}/v1/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'A beautiful sunset over the ocean',
      mode: 'final',
      resolution: '2K',
      aspectRatio: '16:9'
    })
  });
  
  const job = await response.json();
  console.log('Job ID:', job.jobId);
  console.log('Status:', job.status);
  
  return job.jobId;
}

// 查询任务状态
async function checkJobStatus(jobId) {
  const response = await fetch(`${BASE_URL}/v1/jobs/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  
  return await response.json();
}

// 轮询直到完成
async function waitForCompletion(jobId) {
  while (true) {
    const result = await checkJobStatus(jobId);
    console.log('Status:', result.status);
    
    if (result.status === 'SUCCEEDED') {
      console.log('\n✅ 生成成功!');
      console.log('图片URL:', result.resultUrls[0]);
      break;
    } else if (result.status === 'FAILED') {
      console.log('\n❌ 生成失败:', result.error);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 10000)); // 等待10秒
  }
}

// 使用示例
(async () => {
  const jobId = await createJob();
  await waitForCompletion(jobId);
})();
```

---

## ⚠️ 重要注意事项

### 1. 字段名使用 camelCase

```bash
✅ 正确:
"negativePrompt": "ugly"
"aspectRatio": "16:9"

❌ 错误:
"negative_prompt": "ugly"
"aspect_ratio": "16:9"
```

### 2. 服务端点通过 params 指定

```bash
✅ 正确:
"params": {"endpoint": "yunwu"}

❌ 错误:
"service": "yunwu"
"endpoint": "yunwu"  # 应该在 params 里
```

### 3. 参考图片使用 inputImage

```bash
✅ 正确:
"inputImage": "data:image/jpeg;base64,..."

❌ 错误:
"referenceImage": "..."
"initImage": "..."
"image": "..."
```

### 4. 没有 Stable Diffusion 相关参数

```bash
❌ 不支持:
"width": 1024          # 用 aspectRatio + resolution
"height": 1024
"seed": 12345
"steps": 30
"cfgScale": 7.5
"sampler": "Euler"
```

### 5. 获取 JWT Token

```bash
# 先登录获取 Token
curl -X POST https://dream-api.newpai.cn/v1/auth/phone-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "code": "123456"
  }'

# 返回
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {...}
}
```

---

## 🔗 相关文档

- [完整 API 文档](./API.md)
- [交互式 API 测试](./api.html)
- [开发者 Token](./api-keys/developer-token.txt)

---

## 📞 技术支持

如有问题，请联系技术支持或查看项目文档。

**最后更新**: 2026-03-09
