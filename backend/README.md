# Dream WeChat Backend

AI Image Generation Backend API for WeChat Mini-Program

[![NestJS](https://img.shields.io/badge/NestJS-10.3.0-brightgreen.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run start:dev

# Start with Docker (recommended)
docker-compose up -d
```

## 📋 Features

### ✅ Completed Features

#### Authentication
- [x] WeChat OAuth Login (code2session)
- [x] JWT Token Generation & Validation
- [x] Token Refresh
- [x] User Info Retrieval

#### User Management
- [x] User CRUD Operations
- [x] VIP Level Management
- [x] User Statistics (Orders, Favorites, Points)

#### VIP/Subscription
- [x] VIP Plans Management
- [x] VIP Info Retrieval
- [x] Order Creation (WeChat Pay Integration)
- [x] Payment Callback Handling
- [x] Order List & Details (Pagination + Cursor)
- [x] Quota Management

#### Orders & Payments
- [x] Order Creation
- [x] Order Retrieval (List + Detail)
- [x] Payment Callback
- [x] Order Status Management

#### API Proxy (Third-party Integration)
- [x] Image Generation Proxy
- [x] Job List Proxy
- [x] Job Detail Proxy
- [x] Job Cancellation Proxy
- [x] Bearer Token Forwarding
- [x] Error Handling & Logging

#### Favorites
- [x] Add to Favorites
- [x] Remove from Favorites
- [x] List User Favorites (Pagination)
- [x] Check Favorite Status
- [x] Type Support (Image/Prompt)

#### Gallery/Image Library
- [x] List Gallery Images (Pagination + Cursor)
- [x] Get Categories
- [x] Like/Unlike Images
- [x] Publish to Gallery
- [x] Author Attribution

#### Points System
- [x] Balance Query
- [x] Points Recharge (WeChat Pay)
- [x] Transaction History (Pagination)
- [x] Points Deduction (Automatic)

#### Templates Management
- [x] Prompt Templates List
- [x] Param Templates List
- [x] Usage Counter
- [x] Category Filtering
- [x] Trending Support

#### Characters (锁脸角色)
- [x] Character CRUD Operations
- [x] Photo Upload to R2 (Base64)
- [x] Photo Management (Add/Delete)
- [x] User-Character Association
- [x] Max 10 Photos per Character

#### Admin (管理后台)
- [x] Admin API Key Authentication
- [x] User List/Detail/Delete
- [x] Set User VIP (with days or expireAt)
- [x] Cancel User VIP
- [x] Template CRUD (with Admin guard)
- [x] Dashboard Stats

#### Statistics
- [x] User Statistics (Orders, Favorites, Points, Balance)
- [x] Global Statistics (Total Users, Orders, Images)
- [x] Usage Analytics

---

## 📊 Database Schema

### Entities

| Entity | Description |
|--------|-------------|
| User | User information, VIP level, timestamps |
| VipPlan | Subscription plans, pricing, benefits |
| Order | Purchase orders, status, timestamps |
| PointTransaction | Points transactions, types |
| Favorite | User favorites with types |
| GalleryImage | Public gallery images, likes |
| PromptTemplate | Pre-built prompt templates |
| ParamTemplate | Pre-built parameter templates |
| Character | User characters for face-lock generation |
| CharacterPhoto | Character photos stored in R2 |

### Seed Data

- ✅ 3 VIP Plans (Monthly, Yearly, Lifetime)
- ✅ 10 Prompt Templates (various styles)
- ✅ 8 Param Templates (different modes/resolutions)
- ✅ 2 Sample Gallery Images

---

## 🔌 Security

### Implemented

- [x] JWT Token Authentication
- [x] Request Rate Limiting (Throttler)
- [x] Input Validation (class-validator)
- [x] SQL Injection Prevention (TypeORM parameterized queries)
- [x] CORS Configuration
- [x] Helmet Security Headers
- [x] Response Compression
- [x] Request ID Logging
- [x] Global Exception Handling

---

## 📚 API Documentation

Once running, access:

- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **API Root**: http://localhost:3000/

### API Endpoints Summary

#### Authentication
```
POST   /v1/auth/wechat-login    WeChat OAuth login
POST   /v1/auth/refresh-token   Refresh JWT token
GET    /v1/auth/userinfo       Get current user info
```

#### User
```
GET    /v1/users/:id   Get user by ID
```

#### VIP
```
GET    /v1/vip/plans        List all VIP plans
GET    /v1/vip/info         Get VIP info & quota
POST   /v1/vip/purchase    Purchase VIP plan
```

#### Orders
```
GET    /v1/orders              List user orders (with pagination)
GET    /v1/orders/:orderId      Get order details
POST   /v1/vip/payment-callback  WeChat pay callback
```

#### Proxy (Third-party API)
```
POST   /v1/proxy/images/generate  Generate image
GET    /v1/proxy/jobs              List jobs
GET    /v1/proxy/jobs/:jobId      Get job status
DELETE /v1/proxy/jobs/:jobId   Cancel job
```

#### Favorites
```
POST   /v1/favorites              Add to favorites
DELETE /v1/favorites/:id        Remove from favorites
GET    /v1/favorites              List favorites (with pagination)
GET    /v1/favorites/check         Check if favorited
```

#### Gallery
```
GET    /v1/gallery/images         List gallery images
GET    /v1/gallery/categories      Get categories
POST   /v1/gallery/images/:id/like    Like image
DELETE /v1/gallery/images/:id/like    Unlike image
POST   /v1/gallery/publish          Publish image to gallery
```

#### Points
```
GET    /v1/points/balance        Get points balance
GET    /v1/points/transactions    Get transaction history
POST   /v1/points/recharge        Recharge points (WeChat Pay)
```

#### Templates
```
GET    /v1/templates/prompts        List prompt templates
GET    /v1/templates/params        List param templates
POST   /v1/templates/prompts/:id/usage  Increment template usage
```

#### Stats
```
GET    /v1/stats/overview         Get user statistics
GET    /v1/stats/global            Get global statistics
```

#### Characters (锁脸角色)
```
GET    /v1/characters                          List user characters
POST   /v1/characters                          Create character
GET    /v1/characters/:id                      Get character detail
PUT    /v1/characters/:id                      Update character
DELETE /v1/characters/:id                      Delete character
POST   /v1/characters/:id/photos/upload        Upload photo to R2 (base64)
POST   /v1/characters/:id/photos               Add photo by URL
GET    /v1/characters/:id/photos/:photoId      Get photo detail
DELETE /v1/characters/:id/photos/:photoId      Delete photo
```

#### Upload
```
POST   /v1/upload/image            Upload image (local storage)
```

#### Admin (需要 X-Admin-Key 请求头)
```
GET    /v1/admin/users                 List users (pagination, search)
GET    /v1/admin/users/:id             Get user detail
PUT    /v1/admin/users/:id             Update user info
DELETE /v1/admin/users/:id             Delete user
PUT    /v1/admin/users/:id/vip         Set user VIP
DELETE /v1/admin/users/:id/vip         Cancel user VIP
GET    /v1/admin/stats                 Dashboard statistics
```

#### Application
```
GET    /health                    Health check
GET    /                          Welcome message
```

---

## 🗂 Project Structure

```
backend/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/          # Authentication (WeChat login, JWT)
│   │   ├── users/         # User management
│   │   ├── vip/           # VIP/Subscription system
│   │   ├── orders/        # Order management
│   │   ├── proxy/         # API proxy to third-party
│   │   ├── favorites/     # Favorites system
│   │   ├── gallery/       # Image gallery
│   │   ├── points/        # Points system
│   │   ├── templates/     # Template management
│   │   ├── characters/    # Characters for face-lock (R2 storage)
│   │   ├── upload/        # File upload
│   │   └── stats/         # Statistics
│   ├── common/           # Shared utilities
│   │   ├── decorators/    # Custom decorators
│   │   ├── filters/       # Exception filters
│   │   ├── interceptors/   # Interceptors (Request ID, Logging)
│   │   ├── pipes/         # Custom pipes
│   │   ├── guards/        # Route guards (JWT Auth)
│   │   ├── providers/      # Shared services (Redis, HTTP)
│   │   ├── dto/          # Data transfer objects
│   │   ├── enums/         # Enums (VipLevel, OrderStatus, etc.)
│   │   └── utils/         # Utility functions
│   ├── config/           # Configuration
│   ├── database/         # Database migrations and seeds
│   ├── app.module.ts     # Root module
│   ├── main.ts           # Application entry point
│   └── app.controller.ts # Root controller
├── test/                   # Test files
├── .env.example            # Environment variables template
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose services
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

---

## 🛠 Development

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Database Seeding

```bash
# Run seeds
npm run seed
```

---

## 🔐 Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=dream_wechat

# Redis
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# WeChat
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret

# WeChat Pay
WECHAT_PAY_MCH_ID=your_merchant_id
WECHAT_PAY_KEY=your_pay_key
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/v1/orders/payment-callback

# Third-party API
THIRD_PARTY_API_BASE_URL=http://localhost:3001
THIRD_PARTY_API_KEY=your_api_key

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=dream-wechat-assets
R2_PUBLIC_URL=https://assets.your-domain.com

# Admin API Key
ADMIN_API_KEY=your-admin-api-key

# CORS
CORS_ORIGIN=*
```

### Configuration Files

| File | Description |
|------|-------------|
| `.env` | Environment variables (NEVER commit this file) |
| `.env.example` | Template for environment variables |
| `src/config/app.config.ts` | Main application configuration |
| `src/database/database.config.ts` | Database configuration |

---

## 📝 Scripts

| Command | Description |
|----------|-------------|
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start with debug mode |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Lint code |
| `npm run format` | Format code with Prettier |
| `npm run migration:generate` | Generate database migration |
| `npm run migration:run` | Run database migrations |
| `npm run seed` | Run database seeds |

---

## 🔧 Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|--------|---------|
| **NestJS** | 10.3.0 | Backend framework |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **TypeORM** | 0.3.20 | ORM for database |
| **PostgreSQL** | 15 | Primary database |
| **Redis** | 7.x | Caching & sessions |
| **Passport** | 0.7.0 | Authentication |
| **JWT** | 4.6.1 | Token authentication |
| **class-validator** | 0.14.1 | Input validation |
| **Throttler** | 5.1.1 | Rate limiting |
| **Helmet** | 7.1.1 | Security headers |
| **Swagger** | 7.3.0 | API documentation |
| **compression** | 1.7.4 | Response compression |

### Dependencies

See `package.json` for complete list.

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` file
   - Use strong secrets in production
   - Rotate secrets regularly

2. **API Security**
   - Always validate input data
   - Use parameterized queries to prevent SQL injection
   - Implement rate limiting
   - Use HTTPS in production

3. **Authentication**
   - Use secure JWT secret keys
   - Set appropriate token expiration
   - Implement token refresh mechanism
   - Log authentication failures

4. **Database**
   - Use environment variables for credentials
   - Enable connection pooling
   - Use indexes for frequently queried fields
   - Implement migrations for schema changes

---

## 📊 Performance Optimization

### Implemented Optimizations

- [x] Redis caching for frequently accessed data
- [x] Database query optimization with indexes
- [x] Pagination for large datasets
- [x] Cursor-based pagination for efficient scrolling
- [x] Connection pooling with TypeORM
- [x] Response compression
- [x] Lazy loading in TypeORM relations

---

## 🌐 Deployment

### Docker Deployment

The application is containerized and can be deployed using Docker:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Environment Configuration

The application supports three environments:

- **Development**: Hot reload, detailed logging
- **Production**: Optimized build, minimal logging

---

## 📚 Documentation

- [Swagger API Docs](http://localhost:3000/api/docs) - Auto-generated API documentation
- [API.md](./docs/API.md) - Complete API documentation
- [api.html](./docs/api.html) - Interactive API tester (open in browser)
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Development progress

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript
- [Passport](http://www.passportjs.org/) - Authentication middleware
- [Vant Weapp](https://vant-ui.github.io/vant-weapp/) - UI components for frontend
- [WeChat](https://developers.weixin.qq.com/) - WeChat API documentation

---

**Version**: 1.0.0

**Last Updated**: 2026-01-29

**Status**: ✅ All core features implemented and ready for testing
