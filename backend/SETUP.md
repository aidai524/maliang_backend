# Backend Setup Guide

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:

- Node.js >= 18.0.0
- Docker & Docker Compose
- PostgreSQL client (for local development)
- Redis client (for local development)

### Setup Steps

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd dream-wechat/backend
   ```

2. **Run setup script** (recommended)
   ```bash
   ./setup.sh
   ```

   This will:
   - Create `.env` file from example
   - Install npm dependencies
   - Build Docker containers

3. **Configure environment variables**

   Edit `.env` file with your actual configuration:

   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_HOST=postgres
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_postgres_password
   DATABASE_NAME=dream_wechat
   REDIS_HOST=redis
   REDIS_PORT=6379
   REDIS_PASSWORD=
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRATION=7d
   WECHAT_APPID=your_actual_wechat_appid
   WECHAT_SECRET=your_actual_wechat_secret
   WECHAT_PAY_MCH_ID=your_merchant_id
   WECHAT_PAY_KEY=your_pay_key
   WECHAT_PAY_NOTIFY_URL=https://your-domain.com/v1/orders/payment-callback
   THIRD_PARTY_API_BASE_URL=http://localhost:3001
   CORS_ORIGIN=*
   THROTTLE_TTL=60
   THROTTLE_LIMIT=100
   ```

4. **Start services**

   **Option A: Using Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

   **Option B: Using local services**
   ```bash
   # Start PostgreSQL
   docker start postgres

   # Start Redis
   docker start redis

   # Install dependencies
   npm install

   # Start application
   npm run start:dev
   ```

5. **Run database seeds**

   ```bash
   npm run seed
   ```

## 📚 API Documentation

Once the application is running:

- **Swagger UI**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## 🔧 Development

### Running in Development Mode

```bash
npm run start:dev
```

The application will:
- Listen for file changes
- Automatically recompile TypeScript
- Restart the server
- Provide source maps for debugging

### Running in Debug Mode

```bash
npm run start:debug
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 🗄 Database

### Migrations

```bash
# Generate new migration
npm run migration:generate -- MigrationName=add_new_field

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### Seeds

```bash
# Run all seeds
npm run seed
```

### Accessing Database

**Using Docker:**
```bash
# Connect to PostgreSQL
docker exec -it dream_wechat_postgres psql -U postgres -d dream_wechat

# Connect to Redis
docker exec -it dream_wechat_redis redis-cli
```

**Using local installation:**
```bash
# Connect to PostgreSQL
psql -U postgres -d dream_wechat

# Connect to Redis
redis-cli
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# View logs for all services
docker-compose logs

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Restart services
docker-compose restart

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Application port | 3000 |
| API_PREFIX | API prefix | v1 |
| DATABASE_HOST | PostgreSQL host | postgres |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_USERNAME | PostgreSQL username | postgres |
| DATABASE_PASSWORD | PostgreSQL password | postgres |
| DATABASE_NAME | Database name | dream_wechat |
| REDIS_HOST | Redis host | redis |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | (empty) |
| JWT_SECRET | JWT secret key | your-super-secret-jwt-key |
| JWT_EXPIRATION | JWT token expiration | 7d |
| WECHAT_APPID | WeChat App ID | (empty) |
| WECHAT_SECRET | WeChat App Secret | (empty) |
| WECHAT_PAY_MCH_ID | WeChat Pay Merchant ID | (empty) |
| WECHAT_PAY_KEY | WeChat Pay Key | (empty) |
| WECHAT_PAY_NOTIFY_URL | Payment callback URL | (empty) |
| THIRD_PARTY_API_BASE_URL | Third-party API URL | http://localhost:3001 |
| CORS_ORIGIN | CORS origin | * |
| THROTTLE_TTL | Rate limit TTL | 60 |
| THROTTLE_LIMIT | Rate limit per TTL | 100 |

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains sensitive information
2. **Change JWT_SECRET** in production
3. **Use strong passwords** for database
4. **Configure CORS_ORIGIN** properly in production
5. **Enable HTTPS** in production
6. **Use secrets management** for cloud deployments

## 🐛 Troubleshooting

### Database connection failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it dream_wechat_postgres psql -U postgres -d dream_wechat
```

### Redis connection failed

```bash
# Check if Redis is running
docker ps | grep redis

# Check Redis logs
docker-compose logs redis

# Test connection
docker exec -it dream_wechat_redis redis-cli ping
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Build failed

```bash
# Clear cache
rm -rf dist node_modules

# Reinstall dependencies
npm install

# Build again
npm run build
```

## 📞 Support

For issues or questions:
- Check the README.md
- Review API documentation at `/api/docs`
- Check Docker logs: `docker-compose logs`
