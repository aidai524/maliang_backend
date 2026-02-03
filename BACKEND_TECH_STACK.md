# 后端技术栈选型建议

## 📋 项目背景

根据您的需求，我们需要构建一个具有以下特点的后端服务：

1. **BFF (Backend for Frontend) 模式** - 作为小程序的业务层
2. **API 网关/代理** - 透传请求到第三方图片生成 API
3. **微信生态集成** - 微信登录、微信支付
4. **用户管理** - JWT 认证、VIP/会员系统
5. **业务逻辑** - 订单、积分、收藏、统计
6. **部署便利** - 易于部署和扩展

---

## 🎯 推荐技术栈

### 首选方案：**Node.js + NestJS + PostgreSQL + Redis**

```
┌─────────────────────────────────────────────────────────┐
│                    微信小程序                        │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│          我们的后端服务 (BFF 层)                   │
│                                                   │
│  ┌──────────────────────────────────────┐           │
│  │      NestJS (Node.js/TypeScript)   │           │
│  │                                   │           │
│  │  - 微信 OAuth 认证                   │           │
│  │  - 微信支付集成                      │           │
│  │  - JWT Token 管理                   │           │
│  │  - VIP 会员系统                     │           │
│  │  - 订单/积分管理                     │           │
│  │  - 业务逻辑处理                     │           │
│  │  - API 代理/透传                    │           │
│  └──────────────────────────────────────┘           │
│                                                   │
│  ┌────────────┐  ┌────────────┐                 │
│  │ PostgreSQL │  │   Redis    │                 │
│  │           │  │            │                 │
│  │ - 用户数据  │  │ - 缓存      │                 │
│  │ - 订单数据  │  │ - Session   │                 │
│  │ - VIP 信息  │  │ - 限流      │                 │
│  │ - 收藏/点赞 │  │ - 队列      │                 │
│  └────────────┘  └────────────┘                 │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS + Bearer Token
┌────────────────────▼────────────────────────────────┐
│         第三方图片生成 API                        │
│  (您现有的 Image SaaS API)                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 技术栈详细对比

### 1. 编程语言和框架

| 技术 | 优势 | 劣势 | 推荐指数 |
|------|--------|--------|----------|
| **Node.js + NestJS** | - 与前端同语言，全栈 TypeScript<br>- 微信 SDK 生态成熟<br>- 异步 I/O 适合 API 代理<br>- 模块化架构，易于维护<br>- 强大的依赖注入系统<br>- 开发速度快<br>- 部署方便 (Docker/Serverless) | - 单线程，CPU 密集型任务稍弱 | ⭐⭐⭐⭐⭐⭐ |
| **Python + FastAPI** | - 开发效率高<br>- 类型安全<br>- 异步支持好<br>- 微信 SDK 支持 | - 部署稍复杂<br>- 性能略低于 Node.js<br>- 生态成熟度一般 | ⭐⭐⭐⭐ |
| **Go + Gin** | - 性能最强<br>- 部署简单（单二进制）<br>- 并发能力强 | - 开发速度较慢<br>- 微信 SDK 生态较弱<br>- 需要额外封装 | ⭐⭐⭐ |
| **Node.js + Express** | - 生态最成熟<br>- 简单灵活 | - 缺少结构化<br>- 大型项目难以维护<br>- 需要自己搭建很多基础功能 | ⭐⭐⭐ |

### 2. 为什么选择 NestJS？

#### 核心优势

**1. 完美的微信生态集成**

```typescript
// 微信登录 - 简单易用
@Injectable()
export class WechatAuthService {
  constructor(
    private wechatService: WechatService,
    private jwtService: JwtService,
  ) {}

  async login(code: string, userInfo: UserInfoDto) {
    // 1. 用 code 换取 openid
    const { openid, session_key } = await this.wechatService.code2Session(code);

    // 2. 查找或创建用户
    let user = await this.userService.findByOpenid(openid);
    if (!user) {
      user = await this.userService.create({
        openid,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        vipLevel: VipLevel.NORMAL,
      });
    }

    // 3. 生成 JWT Token
    const token = this.jwtService.sign({ userId: user.id });

    return { token, user };
  }
}
```

```typescript
// 微信支付 - 官方 SDK 集成
@Injectable()
export class WechatPayService {
  async createOrder(planId: string, userId: string) {
    const plan = await this.vipPlanService.findOne(planId);

    const params = {
      appid: config.wechat.appid,
      mch_id: config.wechat.mch_id,
      nonce_str: generateNonce(),
      body: plan.name,
      out_trade_no: generateOrderId(),
      total_fee: plan.currentPrice,
      // ... 更多参数
    };

    const sign = this.generateSign(params);
    const unifiedOrder = await this.wechatPayAPI.unifiedOrder(params);

    return this.formatForMiniProgram(unifiedOrder);
  }
}
```

**2. API 代理/透传 - 天然优势**

```typescript
// 代理到第三方 API
@Controller('proxy')
export class ProxyController {
  constructor(private httpService: HttpService) {}

  @Post('images/generate')
  async generateImage(
    @Headers('Authorization') authHeader: string,
    @Body() generateDto: GenerateImageDto,
  ) {
    // 提取用户 token
    const userToken = authHeader.replace('Bearer ', '');

    // 代理请求到第三方 API
    const response = await this.httpService.axios.post(
      'http://localhost:3001/v1/images/generate',
      generateDto,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }
}
```

**3. 完善的架构和工具链**

- **装饰器路由** - `@Controller()`, `@Get()`, `@Post()`
- **自动验证** - `class-validator`, `class-transformer`
- **依赖注入** - `@Injectable()`, `constructor()`
- **中间件** - Guards, Interceptors, Pipes
- **Swagger** - `@nestjs/swagger` 自动生成文档
- **数据库 ORM** - `@nestjs/typeorm` 或 `@nestjs/prisma`

**4. 开发效率和可维护性**

```typescript
// 清晰的模块划分
@Module({
  imports: [
    UsersModule,
    VipModule,
    OrdersModule,
    PointsModule,
    GalleryModule,
    FavoritesModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

### 3. 数据库选择

| 数据库 | 用途 | 推荐方案 |
|--------|--------|----------|
| **PostgreSQL** | 主数据库<br>- 用户信息<br>- 订单数据<br>- VIP 订阅<br>- 收藏/点赞<br>- 模板配置 | ✅ **推荐**<br>- 数据一致性强<br>- 支持复杂查询<br>- 事务支持完善<br>- JSON 字段支持灵活数据 |
| **Redis** | 缓存和队列<br>- JWT Token 黑名单<br>- API 响应缓存<br>- 限流计数器<br>- 分布式锁 | ✅ **推荐**<br>- 高性能<br>- 适合缓存场景<br>- 支持过期策略 |
| **MongoDB** | 替代方案<br>- 图片元数据<br>- 日志数据 | ⚠️ **可选**<br>- 灵活的 Schema<br>- 适合非结构化数据<br>- 但不是必需 |

#### 数据库表结构设计

```sql
-- PostgreSQL 核心表结构

-- 1. 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  openid VARCHAR(100) UNIQUE NOT NULL,
  nick_name VARCHAR(100),
  avatar_url TEXT,
  vip_level VARCHAR(20) DEFAULT 'NORMAL',
  vip_expire_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. VIP 套餐表
CREATE TABLE vip_plans (
  id SERIAL PRIMARY KEY,
  plan_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  duration INT NOT NULL, -- 天数
  original_price INT NOT NULL, -- 分
  current_price INT NOT NULL, -- 分
  benefits JSONB, -- JSON 数组
  popular BOOLEAN DEFAULT FALSE
);

-- 3. 订单表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id),
  plan_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'PENDING',
  amount INT NOT NULL,
  paid_at TIMESTAMP,
  vip_expire_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 积分记录表
CREATE TABLE points_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- EARN, SPEND, REFUND
  amount INT NOT NULL,
  description VARCHAR(200),
  balance_after INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 图片库表
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  category_id VARCHAR(50),
  author_id INT REFERENCES users(id),
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 收藏表
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- image, prompt
  resource_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, type, resource_id)
);

-- 7. 提示词模板表
CREATE TABLE prompt_templates (
  id SERIAL PRIMARY KEY,
  template_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(50),
  thumbnail_url TEXT,
  usage_count INT DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE
);
```

---

### 4. 部署方案

#### 方案 1：**腾讯云 + Docker (推荐)**

**适合：** 微信小程序、国内用户

```
┌────────────────────────────────────────┐
│        腾讯云 CVM (2核4G)        │
│                                   │
│  ┌──────────────────────────────┐   │
│  │   Docker Compose         │   │
│  │                            │   │
│  │  - NestJS App            │   │
│  │  - PostgreSQL (容器)        │   │
│  │  - Redis (容器)          │   │
│  │  - Nginx (反向代理)        │   │
│  └──────────────────────────────┘   │
│                                   │
│  ┌──────────────────────────────┐   │
│  │   腾讯云 COS (对象存储)    │   │
│  │   - 图片存储              │   │
│  │   - 日志存储              │   │
│  └──────────────────────────────┘   │
│                                   │
│  ┌──────────────────────────────┐   │
│  │   腾讯云 CLB (负载均衡)    │   │
│  └──────────────────────────────┘   │
└────────────────────────────────────────┘
```

**优势：**
- ✅ 微信生态原生支持
- ✅ 国内访问速度快
- ✅ 证书配置简单
- ✅ 成本低（约 ¥100-300/月）
- ✅ 扩展方便

**部署步骤：**

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/dbname
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
      - WECHAT_APPID=your-appid
      - WECHAT_SECRET=your-secret
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
# 一键部署
git clone <your-repo>
cd dream-wechat-backend
cp .env.example .env
# 编辑 .env 文件，填入配置
docker-compose up -d
```

---

#### 方案 2：**Railway (PaaS)**

**适合：** 快速部署、海外用户

**优势：**
- ✅ 零配置部署
- ✅ 自动 HTTPS
- ✅ 自动扩展
- ✅ GitHub 集成
- ✅ 免费额度充足

**成本：**
- 免费额度：$5/月
- 生产环境：约 $20-50/月

**部署步骤：**
```bash
# 1. 连接 GitHub
# 2. 选择仓库
# 3. Railway 自动检测到 Dockerfile 或 package.json
# 4. 配置环境变量
# 5. 一键部署
```

---

#### 方案 3：**腾讯云云开发 (TCB)**

**适合：** 微信小程序专属

**优势：**
- ✅ 微信官方推荐
- ✅ 免费额度大
- ✅ 无需服务器维护
- ✅ 内置微信登录/支付

**劣势：**
- ❌ 只能使用 Serverless
- ❌ 冷启动延迟
- ❌ 调试复杂

**成本：**
- 免费额度：192000 GBs/月
- 超出后：按量计费

---

## 🚀 快速开始 - 项目结构

```
dream-wechat-backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # 认证模块
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/             # 用户模块
│   │   ├── vip/               # 会员模块
│   │   ├── orders/            # 订单模块
│   │   ├── points/            # 积分模块
│   │   ├── gallery/           # 图片库模块
│   │   ├── favorites/         # 收藏模块
│   │   ├── templates/         # 模板模块
│   │   └── proxy/            # API 代理模块
│   ├── common/
│   │   ├── decorators/       # 装饰器
│   │   ├── filters/          # 过滤器
│   │   ├── interceptors/     # 拦截器
│   │   ├── pipes/            # 管道
│   │   └── utils/           # 工具函数
│   ├── database/
│   │   ├── migrations/       # 数据库迁移
│   │   └── seeds/           # 种子数据
│   ├── config/              # 配置
│   ├── app.module.ts         # 根模块
│   ├── main.ts              # 入口文件
│   └── app.e2e-spec.ts      # E2E 测试
├── test/                   # 测试文件
├── .env.example            # 环境变量示例
├── Dockerfile             # Docker 配置
├── docker-compose.yml     # Docker Compose
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

---

## 📦 核心依赖包

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "ioredis": "^5.3.0",
    "axios": "^1.6.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "wechatpay-node-v3": "^2.3.0",
    "crypto-js": "^4.1.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "typescript": "^5.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.0"
  }
}
```

---

## 🔐 安全和最佳实践

### 1. JWT Token 管理

```typescript
// 生成 Token
async generateToken(userId: string) {
  const payload = { userId, type: 'access' };
  const token = this.jwtService.sign(payload, {
    expiresIn: '7d', // 7天过期
  });

  // 存储 Token 黑名单（用于登出）
  await this.redis.setex(`token:${userId}`, 7 * 24 * 3600, token);

  return token;
}

// 验证 Token
async validateToken(token: string) {
  try {
    const payload = this.jwtService.verify(token);

    // 检查黑名单
    const blacklisted = await this.redis.get(`token:${payload.userId}`);
    if (blacklisted === token) {
      throw new UnauthorizedException('Token 已失效');
    }

    return payload;
  } catch (error) {
    throw new UnauthorizedException('Token 无效');
  }
}
```

### 2. API 代理安全

```typescript
// 请求限流
@Injectable()
export class ThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): string {
    return req.ip; // 基于 IP 限流
  }
}

// 添加请求 ID（用于追踪）
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const requestId = generateUUID();
    Request.id = requestId;

    return next.handle().pipe(
      tap(() => {
        // 记录请求日志
        this.logger.log(`${requestId} - ${context.switchToHttp().getRequest().url}`);
      })
    );
  }
}
```

### 3. 错误处理

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : '服务器内部错误';

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json({
      error: exception instanceof HttpException ? exception.name : 'INTERNAL_ERROR',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## 📊 性能优化

### 1. Redis 缓存策略

```typescript
@Injectable()
export class CacheService {
  constructor(@InjectRedis() private redis: Redis) {}

  // 缓存用户信息 (1小时)
  async getUserInfo(userId: string) {
    const cacheKey = `user:${userId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.userService.findById(userId);
    await this.redis.setex(cacheKey, 3600, JSON.stringify(user));

    return user;
  }

  // 缓存 API 响应 (5分钟)
  async cacheApiResponse(key: string, data: any) {
    await this.redis.setex(`api:${key}`, 300, JSON.stringify(data));
  }
}
```

### 2. 数据库查询优化

```typescript
// 使用索引
@Entity('users')
export class User {
  @PrimaryColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  openid: string;

  @Index()
  @Column()
  vip_level: string;

  @Column()
  vip_expire_at: Date;
}

// 使用分页查询
async getGalleryImages(page: number, limit: number) {
  return this.galleryRepository.find({
    order: { created_at: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

---

## 📝 API 文档

使用 `@nestjs/swagger` 自动生成 API 文档：

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 配置
  const config = new DocumentBuilder()
    .setTitle('AI 图片生成 API')
    .setDescription('微信小程序后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

访问 `http://localhost:3000/api/docs` 查看完整文档。

---

## 🎯 实施路线图

### 阶段 1：项目搭建（2-3天）

- [ ] 初始化 NestJS 项目
- [ ] 配置 PostgreSQL + Redis
- [ ] 搭建基础模块结构
- [ ] 配置 Docker Compose
- [ ] 配置 Swagger 文档
- [ ] 配置环境变量

### 阶段 2：核心功能（7-10天）

- [ ] 微信登录集成
- [ ] JWT 认证系统
- [ ] 用户 CRUD
- [ ] API 代理功能
- [ ] 订单管理
- [ ] 会员系统基础

### 阶段 3：完整功能（7-10天）

- [ ] 图片库模块
- [ ] 收藏系统
- [ ] 积分系统
- [ ] 模板管理
- [ ] 统计功能

### 阶段 4：优化和部署（3-5天）

- [ ] 性能优化
- [ ] 安全加固
- [ ] 单元测试
- [ ] 部署到生产环境
- [ ] 配置监控和日志

---

## 💡 总结和推荐

### 推荐技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| **后端框架** | NestJS (TypeScript) | 微信生态成熟、开发效率高、架构清晰 |
| **主数据库** | PostgreSQL | 数据一致性强、事务支持、JSON 字段 |
| **缓存** | Redis | 高性能、适合缓存和队列 |
| **部署方案** | Docker + 腾讯云 CVM | 成本低、易维护、扩展方便 |
| **API 代理** | NestJS HttpService | 原生支持、易于集成 |

### 核心优势

✅ **开发效率** - TypeScript + NestJS 提供类型安全和代码提示
✅ **部署便利** - Docker 一键部署，环境一致性
✅ **微信生态** - 完善的 SDK 集成，官方推荐
✅ **性能优秀** - 异步 I/O 适合 API 代理场景
✅ **可维护性** - 模块化架构，清晰的代码结构
✅ **成本可控** - 开源技术栈，无额外授权费用

### 替代方案

如果您对 NestJS 不熟悉，可以考虑：

| 方案 | 适用场景 |
|------|----------|
| **Node.js + Express** | 快速原型、简单项目 |
| **Python + FastAPI** | Python 团队、AI 项目 |
| **Go + Gin** | 高性能要求、大型系统 |

---

## 📚 参考资源

- [NestJS 官方文档](https://docs.nestjs.com)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信支付文档](https://pay.weixin.qq.com/wiki/doc/api/index.html)
- [TypeORM 文档](https://typeorm.io/)
- [Redis 官方文档](https://redis.io/documentation)
- [Docker 官方文档](https://docs.docker.com/)

---

**文档版本**：v1.0
**创建日期**：2026-01-29
**最后更新**：2026-01-29
