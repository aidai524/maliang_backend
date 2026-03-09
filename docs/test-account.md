# 测试账号信息

此账号专门用于开发和测试，可以安全删除该账号的所有数据。

## 账号信息

- **用户ID**: 6
- **手机号**: 13800000000
- **昵称**: 测试账号

## JWT Token

有效期：1年（2027-03-09 到期）

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc3MzA2NzkxOSwiZXhwIjoxODA0NjAzOTE5fQ.nJcFVIoGRTevgAwWLjMAFzznKWGzlcruEAZavQCy-oA
```

## 使用示例

### 创建任务

```bash
curl -X POST https://dream-api.newpai.cn/v1/jobs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc3MzA2NzkxOSwiZXhwIjoxODA0NjAzOTE5fQ.nJcFVIoGRTevgAwWLjMAFzznKWGzlcruEAZavQCy-oA" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test image","mode":"final","resolution":"2K"}'
```

### 查询任务列表

```bash
curl -X GET "https://dream-api.newpai.cn/v1/jobs?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc3MzA2NzkxOSwiZXhwIjoxODA0NjAzOTE5fQ.nJcFVIoGRTevgAwWLjMAFzznKWGzlcruEAZavQCy-oA"
```

## 清理测试数据

### 查看测试数据

```bash
docker exec dream_backend node -e "
const { DataSource } = require('typeorm');
const ds = new DataSource({
  type: 'postgres', host: 'postgres', port: 5432,
  username: 'dream_user', password: 'Dream@2024Secure',
  database: 'dream_wechat', synchronize: false
});
ds.initialize().then(async () => {
  const count = await ds.query('SELECT COUNT(*) as total FROM generations WHERE user_id = 6');
  console.log('Test data count:', count[0].total);
  const gens = await ds.query('SELECT id, job_id, status, created_at FROM generations WHERE user_id = 6 ORDER BY created_at DESC LIMIT 10');
  console.log('Recent test data:', JSON.stringify(gens, null, 2));
  await ds.destroy();
});"
```

### 删除所有测试数据

```bash
docker exec dream_backend node -e "
const { DataSource } = require('typeorm');
const ds = new DataSource({
  type: 'postgres', host: 'postgres', port: 5432,
  username: 'dream_user', password: 'Dream@2024Secure',
  database: 'dream_wechat', synchronize: false
});
ds.initialize().then(async () => {
  const result = await ds.query('DELETE FROM generations WHERE user_id = 6');
  console.log('Deleted', result[1], 'test records');
  await ds.destroy();
});"
```

## 注意事项

1. **只用于测试**：不要用这个账号进行真实业务测试
2. **定期清理**：测试完成后及时清理数据
3. **Token 安全**：虽然这是测试账号，但仍需妥善保管 token
4. **不要删除账号**：只删除 generations 记录，保留用户账号

## 最后更新

2026-03-09
