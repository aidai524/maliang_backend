# Dream Admin - 管理后台

基于 Next.js + shadcn/ui 的管理后台，用于管理 Dream WeChat 应用。

## 功能

- **用户管理**
  - 查看用户列表（分页、搜索）
  - 设置/取消用户 VIP
  - 删除用户

- **模板管理**
  - 提示词模板 CRUD
  - 参数模板 CRUD

- **统计看板**
  - 用户总数
  - VIP 用户数
  - 订单数
  - 今日新增用户

## 快速开始

### 1. 安装依赖

```bash
cd admin
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001

### 4. 登录

使用后端配置的 Admin API Key 登录：

- 默认: `admin_secret_key_change_in_production`

## 部署

### Vercel (推荐)

```bash
npm i -g vercel
vercel
```

### 静态导出

```bash
npm run build
# 输出在 .next 目录
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

## 技术栈

- **框架**: Next.js 15
- **UI**: shadcn/ui + Tailwind CSS
- **状态管理**: React Hooks
- **通知**: Sonner

## 目录结构

```
admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 主页面
│   │   └── globals.css     # 全局样式
│   ├── components/
│   │   ├── ui/             # shadcn 组件
│   │   ├── login-form.tsx  # 登录表单
│   │   ├── dashboard.tsx   # 仪表盘
│   │   ├── users-panel.tsx # 用户管理
│   │   └── templates-panel.tsx # 模板管理
│   └── lib/
│       ├── api.ts          # API 请求
│       └── utils.ts        # 工具函数
├── .env.local              # 环境变量
└── package.json
```
