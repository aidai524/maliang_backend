# 任务状态查询指南

完整的任务状态查询说明，包括状态值、返回格式和轮询策略。

---

## 📡 查询接口

### 基本信息

**接口**: `GET /v1/jobs/{jobId}`

**认证**: 需要 JWT Token

**请求示例**:
```bash
curl -X GET https://dream-api.newpai.cn/v1/jobs/cmmit8xqu000ds689vobmlpob \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 返回格式

### 完整响应示例

#### 1. 任务进行中

```json
{
  "jobId": "cmmit8xqu000ds689vobmlpob",
  "status": "RUNNING",
  "resultUrls": [],
  "error": null,
  "createdAt": "2026-03-09T06:38:58.518Z",
  "updatedAt": "2026-03-09T06:39:30.258Z"
}
```

#### 2. 任务成功

```json
{
  "jobId": "cmmiyl7xe000ts68967qrce8h",
  "status": "SUCCEEDED",
  "resultUrls": [
    "https://assets.newpai.cn/cmmiyl7xe000ts68967qrce8h/1773047330833-0.png"
  ],
  "error": null,
  "createdAt": "2026-03-09T09:08:29.666Z",
  "updatedAt": "2026-03-09T09:08:55.305Z"
}
```

#### 3. 任务失败

```json
{
  "jobId": "cmmit8xqu000ds689vobmlpob",
  "status": "FAILED",
  "resultUrls": [],
  "error": {
    "code": "TIMEOUT",
    "message": "Image generation timeout after 60 seconds"
  },
  "createdAt": "2026-03-09T06:38:58.518Z",
  "updatedAt": "2026-03-09T06:40:34.152Z"
}
```

---

## 🎯 状态说明

### 第三方 API 返回的状态

| 状态值 | 说明 | 是否终态 | 下一步操作 |
|--------|------|----------|-----------|
| `QUEUED` | 任务排队中 | ❌ 否 | 继续轮询 |
| `RUNNING` | 任务处理中 | ❌ 否 | 继续轮询 |
| `RETRYING` | 任务重试中 | ❌ 否 | 继续轮询 |
| `SUCCEEDED` | 任务成功 | ✅ 是 | 获取图片 URL |
| `FAILED` | 任务失败 | ✅ 是 | 查看错误信息 |

### 后端数据库状态映射

后端会将第三方 API 状态映射到本地状态：

| 第三方状态 | 后端状态 | 说明 |
|-----------|---------|------|
| QUEUED | PENDING | 等待处理 |
| RUNNING | PROCESSING | 处理中 |
| RETRYING | PROCESSING | 重试中（视为处理中） |
| SUCCEEDED | COMPLETED | 成功完成 |
| FAILED | FAILED | 任务失败 |

---

## 🖼️ 图片结果

### 结果格式

**返回的是图片 URL，不是 base64**

```json
{
  "resultUrls": [
    "https://assets.newpai.cn/cmmiyl7xe000ts68967qrce8h/1773047330833-0.png"
  ]
}
```

**特点**：
- ✅ 直接可用的 HTTPS URL
- ✅ 托管在 CDN 上（Cloudflare R2）
- ✅ 永久有效（除非手动删除）
- ✅ 支持多种图片格式（PNG、JPEG）

### 使用图片

```bash
# 下载图片
curl -o image.png "https://assets.newpai.cn/cmmiyl7xe000ts68967qrce8h/1773047330833-0.png"

# 在 HTML 中使用
<img src="https://assets.newpai.cn/..." alt="Generated Image">

# 在 Markdown 中使用
![Generated Image](https://assets.newpai.cn/...)
```

### 图片检查

```bash
# 查看图片信息
curl -I https://assets.newpai.cn/cmmiyl7xe000ts68967qrce8h/1773047330833-0.png

# 返回示例
Content-Type: image/png
Content-Length: 1234567
```

---

## 🔄 轮询策略

### 推荐的轮询流程

```
提交任务 → 获取 jobId → 开始轮询 → 检查状态 → 完成/失败
```

### 轮询参数建议

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| **轮询间隔** | 5-10 秒 | 不要过于频繁 |
| **最大轮询次数** | 60 次 | 最多 10 分钟 |
| **超时时间** | 10 分钟 | 超过则视为失败 |
| **退避策略** | 指数退避 | 失败时增加间隔 |

### Python 轮询示例

```python
import requests
import time

def wait_for_job(job_id, token, max_wait=600, poll_interval=5):
    """
    等待任务完成
    
    Args:
        job_id: 任务 ID
        token: JWT Token
        max_wait: 最大等待时间（秒），默认 10 分钟
        poll_interval: 轮询间隔（秒），默认 5 秒
    
    Returns:
        dict: 任务结果
    """
    headers = {"Authorization": f"Bearer {token}"}
    start_time = time.time()
    
    while True:
        # 检查超时
        if time.time() - start_time > max_wait:
            raise TimeoutError(f"任务 {job_id} 超时")
        
        # 查询任务状态
        response = requests.get(
            f"https://dream-api.newpai.cn/v1/jobs/{job_id}",
            headers=headers
        )
        result = response.json()
        status = result.get('status')
        
        print(f"[{time.strftime('%H:%M:%S')}] Job {job_id}: {status}")
        
        # 检查是否完成
        if status == 'SUCCEEDED':
            return {
                "success": True,
                "imageUrl": result['resultUrls'][0],
                "jobId": job_id
            }
        elif status == 'FAILED':
            return {
                "success": False,
                "error": result.get('error'),
                "jobId": job_id
            }
        
        # 等待下次轮询
        time.sleep(poll_interval)

# 使用示例
try:
    result = wait_for_job("cmmit8xqu000ds689vobmlpob", "YOUR_TOKEN")
    if result['success']:
        print(f"✅ 图片生成成功: {result['imageUrl']}")
    else:
        print(f"❌ 图片生成失败: {result['error']}")
except TimeoutError as e:
    print(f"⏱️ {e}")
```

### JavaScript 轮询示例

```javascript
/**
 * 等待任务完成
 */
async function waitForJob(jobId, token, options = {}) {
  const {
    maxWait = 600000, // 10 分钟
    pollInterval = 5000, // 5 秒
    onProgress = null // 进度回调
  } = options;
  
  const startTime = Date.now();
  
  while (true) {
    // 检查超时
    if (Date.now() - startTime > maxWait) {
      throw new Error(`任务 ${jobId} 超时`);
    }
    
    // 查询任务状态
    const response = await fetch(
      `https://dream-api.newpai.cn/v1/jobs/${jobId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const result = await response.json();
    
    // 进度回调
    if (onProgress) {
      onProgress(result);
    }
    
    // 检查是否完成
    if (result.status === 'SUCCEEDED') {
      return {
        success: true,
        imageUrl: result.resultUrls[0],
        jobId
      };
    } else if (result.status === 'FAILED') {
      return {
        success: false,
        error: result.error,
        jobId
      };
    }
    
    // 等待下次轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}

// 使用示例
(async () => {
  try {
    const result = await waitForJob(
      'cmmit8xqu000ds689vobmlpob',
      'YOUR_TOKEN',
      {
        onProgress: (status) => {
          console.log(`[${new Date().toLocaleTimeString()}] Status:`, status.status);
        }
      }
    );
    
    if (result.success) {
      console.log('✅ 图片生成成功:', result.imageUrl);
    } else {
      console.log('❌ 图片生成失败:', result.error);
    }
  } catch (error) {
    console.error('⏱️', error.message);
  }
})();
```

### Bash 轮询示例

```bash
#!/bin/bash

JOB_ID="cmmit8xqu000ds689vobmlpob"
TOKEN="YOUR_JWT_TOKEN"
MAX_ATTEMPTS=60
POLL_INTERVAL=5

echo "=== 开始监控任务: $JOB_ID ==="

for i in $(seq 1 $MAX_ATTEMPTS); do
  # 查询状态
  RESULT=$(curl -s -X GET "https://dream-api.newpai.cn/v1/jobs/${JOB_ID}" \
    -H "Authorization: Bearer ${TOKEN}")
  
  STATUS=$(echo "$RESULT" | jq -r '.status')
  TIMESTAMP=$(date +"%H:%M:%S")
  
  echo "[$TIMESTAMP] 尝试 $i/$MAX_ATTEMPTS - 状态: $STATUS"
  
  # 检查是否完成
  if [ "$STATUS" = "SUCCEEDED" ]; then
    echo ""
    echo "✅ 任务成功!"
    IMAGE_URL=$(echo "$RESULT" | jq -r '.resultUrls[0]')
    echo "图片 URL: $IMAGE_URL"
    exit 0
  elif [ "$STATUS" = "FAILED" ]; then
    echo ""
    echo "❌ 任务失败!"
    ERROR=$(echo "$RESULT" | jq -r '.error.message')
    echo "错误信息: $ERROR"
    exit 1
  fi
  
  # 等待下次轮询
  sleep $POLL_INTERVAL
done

echo ""
echo "⏱️ 任务超时"
exit 2
```

---

## ⏱️ 典型时间线

### 快速生成（draft 模式）

```
提交任务 → QUEUED (2-5秒) → RUNNING (10-20秒) → SUCCEEDED
总耗时: 15-30秒
```

### 标准生成（final 模式）

```
提交任务 → QUEUED (5-10秒) → RUNNING (30-90秒) → SUCCEEDED
总耗时: 40-100秒
```

### 锁脸生成（characterId）

```
提交任务 → QUEUED (5-15秒) → RUNNING (60-180秒) → SUCCEEDED
总耗时: 70-200秒
```

### 高清生成（4K 分辨率）

```
提交任务 → QUEUED (10-30秒) → RUNNING (120-300秒) → SUCCEEDED/FAILED
总耗时: 130-330秒 (可能超时)
```

---

## ❌ 错误处理

### 常见错误状态

#### 1. 配额超限

```json
{
  "statusCode": 403,
  "message": "Daily generation quota exceeded"
}
```

#### 2. 参数错误

```json
{
  "statusCode": 400,
  "message": "Invalid parameters",
  "errors": [
    "Resolution must be one of: 1K, 2K, 4K"
  ]
}
```

#### 3. 任务不存在

```json
{
  "statusCode": 404,
  "message": "Job not found"
}
```

#### 4. 生成失败

```json
{
  "status": "FAILED",
  "error": {
    "code": "CONTENT_POLICY_VIOLATION",
    "message": "Content violates usage policy"
  }
}
```

#### 5. 超时

```json
{
  "status": "FAILED",
  "error": {
    "code": "TIMEOUT",
    "message": "Image generation timeout after 60 seconds"
  }
}
```

### 错误处理建议

```python
def handle_job_error(result):
    """处理任务错误"""
    status = result.get('status')
    error = result.get('error', {})
    error_code = error.get('code', 'UNKNOWN')
    error_message = error.get('message', 'Unknown error')
    
    if error_code == 'CONTENT_POLICY_VIOLATION':
        print("❌ 内容违规，请修改提示词")
    elif error_code == 'TIMEOUT':
        print("⏱️ 生成超时，建议使用 2K 分辨率")
    elif error_code == 'INSUFFICIENT_CREDITS':
        print("💰 余额不足，请充值")
    else:
        print(f"❌ 错误: {error_message}")
    
    # 记录详细错误
    print(f"错误代码: {error_code}")
    print(f"错误详情: {error_message}")
```

---

## 🎯 最佳实践

### 1. 合理设置超时时间

```python
# ❌ 错误：超时太短
result = wait_for_job(job_id, token, max_wait=30)

# ✅ 正确：根据模式设置
max_wait = 120 if mode == 'draft' else 300  # 快速模式 2 分钟，标准模式 5 分钟
result = wait_for_job(job_id, token, max_wait=max_wait)
```

### 2. 使用退避策略

```python
# 指数退避
def get_poll_interval(attempt):
    if attempt < 10:
        return 5  # 前 10 次：5 秒
    elif attempt < 30:
        return 10  # 10-30 次：10 秒
    else:
        return 15  # 30 次以上：15 秒
```

### 3. 保存任务 ID

```python
# ✅ 保存到数据库或文件，避免丢失
job = create_job(...)
save_to_database({
    'job_id': job['jobId'],
    'status': 'PENDING',
    'created_at': datetime.now()
})

# 后续可以从数据库恢复
job_id = load_from_database()
result = wait_for_job(job_id, token)
```

### 4. 并发处理多个任务

```python
import asyncio
import aiohttp

async def wait_for_job_async(job_id, token):
    async with aiohttp.ClientSession() as session:
        while True:
            async with session.get(
                f"https://dream-api.newpai.cn/v1/jobs/{job_id}",
                headers={"Authorization": f"Bearer {token}"}
            ) as response:
                result = await response.json()
                if result['status'] in ['SUCCEEDED', 'FAILED']:
                    return result
            await asyncio.sleep(5)

# 并发处理多个任务
async def main():
    jobs = await create_multiple_jobs(5)
    results = await asyncio.gather(*[
        wait_for_job_async(job['jobId'], token) for job in jobs
    ])
    return results
```

---

## 📊 状态转换图

```
提交任务
   ↓
┌─────────────┐
│   QUEUED    │ (排队中，等待处理)
└─────┬───────┘
      ↓
┌─────────────┐
│   RUNNING   │ (处理中，生成图片)
└─────┬───────┘
      │
      ├────→ SUCCEEDED (成功)
      │         ↓
      │      返回图片 URL
      │
      └────→ FAILED (失败)
                ↓
             返回错误信息

特殊情况：
RUNNING → RETRYING → RUNNING (自动重试)
```

---

## 🔗 相关文档

- [Jobs API 请求示例](./Jobs-API-Examples.md)
- [完整 API 文档](./API.md)
- [交互式 API 测试](./api.html)

---

## 📞 技术支持

如有问题，请联系技术支持或查看项目文档。

**最后更新**: 2026-03-09
