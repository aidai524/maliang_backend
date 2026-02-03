# AI图片生成小程序 - 开发计划

## 📋 项目概览

**项目名称**：AI图片生成小程序
**技术栈**：原生微信小程序 + Vant Weapp UI组件库
**设计风格**：创意活泼（基于Vant Weapp，自定义主题色）
**开发阶段**：功能完整版（包含会员系统）
**预估工期**：31天（完整版） / 15天（MVP版）

---

## 🏗️ 一、项目架构设计

### 1.1 目录结构

```
dream-wechat/
├── miniprogram/
│   ├── pages/                  # 页面
│   │   ├── login/              # 登录页
│   │   ├── home/               # 首页（图片生成）
│   │   ├── gallery/            # 图片库/广场
│   │   ├── history/            # 历史记录
│   │   ├── profile/            # 个人中心
│   │   ├── vip/                # 会员中心
│   │   └── image-detail/       # 图片详情
│   ├── components/             # 自定义组件
│   │   ├── image-card/         # 图片卡片组件
│   │   ├── template-selector/  # 模板选择器
│   │   ├── param-form/         # 参数表单组件
│   │   └── image-editor/       # 图片编辑器
│   ├── utils/                  # 工具类
│   │   ├── api.js              # API封装
│   │   ├── request.js          # 网络请求封装
│   │   ├── storage.js          # 本地存储
│   │   └── constants.js        # 常量定义
│   ├── store/                  # 状态管理
│   │   ├── index.js            # store入口
│   │   ├── user.js             # 用户状态
│   │   ├── jobs.js             # 任务状态
│   │   └── vip.js              # 会员状态
│   ├── styles/                 # 全局样式
│   │   ├── variables.wxss      # 主题变量
│   │   └── common.wxss         # 公共样式
│   ├── config/                 # 配置
│   │   └── index.js            # API配置等
│   ├── app.js                  # 小程序入口
│   ├── app.json                # 全局配置
│   └── app.wxss                # 全局样式
├── cloudfunctions/             # 云函数（可选）
└── project.config.json         # 项目配置
```

### 1.2 技术架构

- **前端框架**：原生微信小程序（WXML + WXSS + JS）
- **UI组件库**：Vant Weapp
- **状态管理**：自定义简易store（基于Page.data）
- **网络请求**：wx.request封装
- **数据存储**：wx.setStorageSync + 云存储（可选）
- **API集成**：已部署的Image SaaS API

---

## 📱 二、核心功能模块设计

### 2.1 用户认证模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 微信授权登录 | 获取用户信息、头像、昵称 | P0 |
| 登录状态管理 | Token存储、自动续期 | P0 |
| 退出登录 | 清除本地缓存 | P0 |

**API设计：**
```
POST /v1/auth/wechat-login
Request: { code, userInfo }
Response: { token, user, isVip }
```

---

### 2.2 图片生成模块（核心）

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 提示词模板选择 | 预设创意提示词模板 | P0 |
| 参数模板选择 | 生成参数预设（风格、尺寸等） | P0 |
| 提交生成任务 | 调用API生成图片 | P0 |
| 任务状态轮询 | 实时查询任务状态 | P0 |
| 进度展示 | 加载动画、进度提示 | P0 |

**页面流程：**
```
首页 → 选择提示词模板 → 选择参数模板 → 提交任务 → 查看进度 → 结果展示
```

**API调用：**
```javascript
POST /v1/images/generate
{
  "prompt": "预设提示词模板内容",
  "mode": "final",
  "resolution": "2K",
  "aspectRatio": "16:9",
  "sampleCount": 1
}
```

---

### 2.3 图片操作模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 图片预览 | 全屏查看、缩放 | P0 |
| 保存到相册 | 下载图片到本地 | P0 |
| 分享功能 | 微信分享、朋友圈 | P0 |
| 收藏/取消收藏 | 本地收藏管理 | P1 |
| 编辑图片 | 基础裁剪、滤镜（可选） | P1 |
| 下载图片 | 下载原图 | P1 |

**使用Vant组件：**
- `van-image-preview` - 图片预览
- `van-action-sheet` - 操作面板
- `van-share-sheet` - 分享面板

---

### 2.4 历史记录模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 任务列表 | 按时间排序展示历史任务 | P0 |
| 状态筛选 | 按成功、失败、进行中筛选 | P0 |
| 分页加载 | 下拉刷新、上拉加载更多 | P0 |
| 任务详情 | 查看任务参数、结果 | P0 |

**API调用：**
```javascript
GET /v1/jobs?status=SUCCEEDED&limit=20&cursor=xxx
```

---

### 2.5 图片库/广场模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 图片展示 | 瀑布流或网格布局 | P0 |
| 提示词展示 | 显示生成提示词 | P0 |
| 一键复制 | 复制提示词 | P0 |
| 点赞功能 | 点赞统计（可选） | P1 |
| 分类浏览 | 按风格、主题分类 | P1 |

---

### 2.6 会员系统模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 会员等级展示 | 普通/VIP/SVIP | P0 |
| 会员权益说明 | 功能对比表格 | P0 |
| 会员购买/续费 | 微信支付集成 | P0 |
| 会员到期提醒 | 到期提示 | P1 |
| 积分系统 | 生成任务消耗积分 | P1 |
| 充值入口 | 积分充值 | P1 |

**会员权益对比：**

| 权益 | 普通用户 | VIP用户 |
|------|----------|---------|
| 每日生成次数 | 5次 | 无限 |
| 高质量模式 | 限制 | 无限 |
| 4K分辨率 | ❌ | ✅ |
| 优先生成 | ❌ | ✅ |
| 历史记录保留 | 30天 | 永久 |

---

### 2.7 个人中心模块

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 用户信息展示 | 头像、昵称、会员标识 | P0 |
| 我的收藏 | 收藏图片列表 | P0 |
| 生成统计 | 总生成次数、成功率 | P1 |
| 设置页面 | 缓存清理、关于我们等 | P1 |

---

## 🎨 三、UI设计规范

### 3.1 主题色系（创意活泼）

```css
/* 主题变量 - 基于Vant Weapp自定义 */
--primary-color: #FF6B9D;      /* 活泼粉 */
--primary-light: #FFA5C8;      /* 浅粉 */
--primary-dark: #E84A85;       /* 深粉 */
--secondary-color: #6C63FF;    /* 渐变紫 */
--accent-color: #00D9FF;       /* 亮蓝点缀 */
--success-color: #00C853;      /* 成功绿 */
--warning-color: #FF9800;      /* 警告橙 */
--danger-color: #FF5252;       /* 错误红 */

/* 背景色 */
--bg-color: #F7F8FA;           /* 浅灰背景 */
--card-bg: #FFFFFF;            /* 卡片背景 */

/* 渐变色 */
--gradient-primary: linear-gradient(135deg, #FF6B9D 0%, #6C63FF 100%);
--gradient-secondary: linear-gradient(135deg, #6C63FF 0%, #00D9FF 100%);
```

### 3.2 Vant组件定制

```javascript
// app.json - 配置Vant主题色
{
  "usingComponents": {
    "van-button": "@vant/weapp/button/index",
    "van-icon": "@vant/weapp/icon/index",
    ...
  },
  "styleIsolation": "shared"
}
```

### 3.3 核心页面设计要点

**登录页：**
- 使用渐变背景（`--gradient-primary`）
- 圆角卡片式登录表单
- 动态图标 + 微信授权按钮

**首页（图片生成）：**
- 瀑布流展示热门模板
- 底部固定生成按钮（悬浮）
- 模态框选择提示词/参数

**历史记录页：**
- 时间轴布局
- 状态标签（成功/失败/进行中）
- 下拉刷新 + 上拉加载

**会员中心：**
- 顶部会员卡片（渐变背景）
- 权益对比表格（使用`van-cell`）
- 购买按钮（突出显示）

---

## 📦 四、开发任务拆分

### 阶段1：项目初始化（2天）

- [ ] 创建微信小程序项目
- [ ] 集成Vant Weapp
- [ ] 配置主题变量和全局样式
- [ ] 搭建项目目录结构
- [ ] 封装网络请求工具
- [ ] 配置API接口常量
- [ ] 实现状态管理（简易store）

### 阶段2：用户认证模块（3天）

- [ ] 设计并实现登录页（参考设计稿）
- [ ] 集成微信授权登录
- [ ] 实现Token存储和管理
- [ ] 登录状态检查和自动登录
- [ ] 实现退出登录功能
- [ ] 个人中心基础页面

### 阶段3：图片生成核心功能（5天）

- [ ] 设计并实现首页UI
- [ ] 提示词模板数据结构设计
- [ ] 参数模板数据结构设计
- [ ] 实现模板选择器组件
- [ ] 实现生成表单组件
- [ ] 调用图片生成API
- [ ] 实现任务状态轮询
- [ ] 设计并实现进度展示
- [ ] 实现生成结果展示

### 阶段4：历史记录模块（3天）

- [ ] 设计历史记录页UI
- [ ] 实现任务列表渲染
- [ ] 实现状态筛选功能
- [ ] 实现分页加载（下拉刷新/上拉加载）
- [ ] 实现任务详情页
- [ ] 本地缓存优化

### 阶段5：图片操作功能（4天）

- [ ] 实现图片预览（使用`van-image-preview`）
- [ ] 实现保存到相册
- [ ] 实现分享功能（微信分享）
- [ ] 实现操作面板（使用`van-action-sheet`）
- [ ] 实现收藏功能
- [ ] 实现图片下载

### 阶段6：图片库/广场模块（4天）

- [ ] 设计图片库页UI
- [ ] 实现瀑布流/网格布局
- [ ] 实现图片展示和预览
- [ ] 实现提示词展示
- [ ] 实现一键复制功能
- [ ] 实现分类浏览
- [ ] （可选）实现点赞功能

### 阶段7：会员系统模块（5天）

- [ ] 设计会员中心页UI
- [ ] 实现会员等级展示
- [ ] 实现会员权益对比表
- [ ] 设计并实现购买/续费流程
- [ ] 集成微信支付
- [ ] 实现会员状态更新
- [ ] 实现到期提醒
- [ ] （可选）实现积分系统
- [ ] （可选）实现积分充值

### 阶段8：个人中心完善（2天）

- [ ] 完善个人中心页面
- [ ] 实现我的收藏功能
- [ ] 实现生成统计
- [ ] 实现设置页面
- [ ] 实现关于页面

### 阶段9：测试与优化（3天）

- [ ] 功能测试和Bug修复
- [ ] 性能优化（图片懒加载、缓存）
- [ ] 用户体验优化
- [ ] 兼容性测试
- [ ] 准备上线材料

---

## ⚙️ 五、关键技术实现方案

### 5.1 网络请求封装

```javascript
// utils/request.js
const BASE_URL = 'http://localhost:3001';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    wx.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve(res.data);
        } else {
          handleError(res);
          reject(res.data);
        }
      },
      fail: reject
    });
  });
}
```

### 5.2 状态轮询实现

```javascript
// 轮询任务状态
async function pollJobStatus(jobId, interval = 2000, maxAttempts = 60) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const result = await getJobStatus(jobId);

    if (result.status === 'SUCCEEDED' || result.status === 'FAILED') {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error('任务超时');
}
```

### 5.3 微信支付集成

```javascript
// 微信支付
function wxPay(payInfo) {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
      success: resolve,
      fail: reject
    });
  });
}
```

---

## 📊 六、开发时间估算

| 阶段 | 任务 | 预估时间 | 优先级 |
|------|------|----------|--------|
| 阶段1 | 项目初始化 | 2天 | P0 |
| 阶段2 | 用户认证模块 | 3天 | P0 |
| 阶段3 | 图片生成核心功能 | 5天 | P0 |
| 阶段4 | 历史记录模块 | 3天 | P0 |
| 阶段5 | 图片操作功能 | 4天 | P0 |
| 阶段6 | 图片库/广场模块 | 4天 | P1 |
| 阶段7 | 会员系统模块 | 5天 | P0 |
| 阶段8 | 个人中心完善 | 2天 | P1 |
| 阶段9 | 测试与优化 | 3天 | P0 |
| **总计** | | **31天** | |

---

## 🎯 七、MVP版本优先级（可快速上线）

如果需要快速上线，可以先实现以下核心功能（约15天）：

### MVP阶段1：核心功能（15天）

1. ✅ 项目初始化（2天）
2. ✅ 用户认证模块（3天）
3. ✅ 图片生成核心功能（5天）
4. ✅ 历史记录模块（3天）
5. ✅ 基础图片操作（保存、分享）（2天）

### 后续迭代计划

**第2版：完整图片操作 + 图片库（6天）**
- [ ] 完整图片操作功能
- [ ] 图片库/广场模块

**第3版：会员系统（5天）**
- [ ] 会员中心
- [ ] 微信支付集成
- [ ] 积分系统

**第4版：个人中心完善（2天）**
- [ ] 我的收藏
- [ ] 生成统计
- [ ] 设置页面

---

## 🚀 八、下一步行动

在开始开发前，请确认以下事项：

### 8.1 设计稿确认
- [ ] 登录页设计稿已确认
- [ ] 其他页面设计参考方案已确认

### 8.2 API端点确认
- [ ] 后端API服务是否支持微信登录？
- [ ] 会员系统相关API是否已开发完成？
- [ ] 支付相关API是否已准备就绪？

### 8.3 开发优先级确认
- [ ] 完整版开发（31天）
- [ ] MVP版本快速上线（15天）

### 8.4 会员系统需求确认
- [ ] 会员等级划分（普通/VIP/SVIP）
- [ ] 付费方式（订阅制/单次购买）
- [ ] 积分系统是否需要

---

## 📚 附录

### A. Vant Weapp 官方文档
- https://vant-ui.github.io/vant-weapp/

### B. 微信小程序官方文档
- https://developers.weixin.qq.com/miniprogram/dev/framework/

### C. API文档
- 详见项目根目录 `API.md` 文件

---

**文档版本**：v1.0
**创建日期**：2026-01-29
**最后更新**：2026-01-29
