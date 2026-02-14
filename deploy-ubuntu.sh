#!/bin/bash

# =========================================
# Dream API 部署脚本 (Ubuntu 24.04)
# 适用于 2GB 内存 VPS，不使用 Docker
# =========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =========================================
# 配置变量（请根据实际情况修改）
# =========================================
APP_NAME="dream-api"
APP_DIR="/opt/$APP_NAME"
BACKEND_PORT=3000
ADMIN_PORT=3002
DOMAIN="api.newpai.cn"           # 你的域名
ADMIN_DOMAIN="admin.newpai.cn"   # 管理后台域名（可选）

# 数据库配置
DB_NAME="dream_wechat"
DB_USER="dream_user"
DB_PASSWORD="your_secure_password_here"  # 请修改为安全密码

# Redis 配置
REDIS_PASSWORD=""  # 留空表示不设置密码

# =========================================
# 1. 系统更新和基础软件安装
# =========================================
install_base() {
    log_info "更新系统包..."
    apt update && apt upgrade -y

    log_info "安装基础软件..."
    apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx

    # 安装 Node.js 20.x
    log_info "安装 Node.js 20.x..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt install -y nodejs
    fi
    node --version
    npm --version

    # 安装 PM2
    log_info "安装 PM2..."
    npm install -g pm2

    log_info "基础软件安装完成"
}

# =========================================
# 2. 安装 PostgreSQL
# =========================================
install_postgresql() {
    log_info "安装 PostgreSQL..."
    
    if ! command -v psql &> /dev/null; then
        apt install -y postgresql postgresql-contrib
    fi

    # 启动 PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql

    # 创建数据库和用户
    log_info "配置 PostgreSQL 数据库..."
    sudo -u postgres psql <<EOF
-- 创建用户（如果不存在）
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- 创建数据库（如果不存在）
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- 授权
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
EOF

    log_info "PostgreSQL 配置完成"
}

# =========================================
# 3. 安装 Redis
# =========================================
install_redis() {
    log_info "安装 Redis..."
    
    if ! command -v redis-server &> /dev/null; then
        apt install -y redis-server
    fi

    # 配置 Redis（节省内存）
    log_info "优化 Redis 配置..."
    cat > /etc/redis/redis.conf.d/memory.conf <<EOF
# 内存优化配置
maxmemory 128mb
maxmemory-policy allkeys-lru
save ""
appendonly no
EOF

    # 如果设置了密码
    if [ -n "$REDIS_PASSWORD" ]; then
        echo "requirepass $REDIS_PASSWORD" >> /etc/redis/redis.conf.d/memory.conf
    fi

    # 创建配置目录（如果不存在）
    mkdir -p /etc/redis/redis.conf.d

    # 重启 Redis
    systemctl restart redis-server
    systemctl enable redis-server

    log_info "Redis 配置完成"
}

# =========================================
# 4. 部署应用代码
# =========================================
deploy_app() {
    log_info "部署应用代码..."

    # 创建应用目录
    mkdir -p $APP_DIR
    cd $APP_DIR

    # 如果代码已存在，更新；否则克隆
    if [ -d "$APP_DIR/.git" ]; then
        log_info "更新代码..."
        git pull origin main
    else
        log_info "克隆代码..."
        # 请替换为你的仓库地址
        git clone https://github.com/aidai524/maliang_backend.git .
    fi

    # 部署后端
    deploy_backend

    # 部署管理后台
    deploy_admin
}

# =========================================
# 5. 部署后端
# =========================================
deploy_backend() {
    log_info "部署后端..."
    cd $APP_DIR/backend

    # 安装依赖
    npm ci --production=false

    # 创建生产环境配置
    if [ ! -f ".env.production" ]; then
        log_warn "请创建 .env.production 配置文件"
        cat > .env.production <<EOF
# 生产环境配置
NODE_ENV=production

# 应用
PORT=$BACKEND_PORT
API_PREFIX=v1

# 数据库
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=$DB_NAME

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT（请修改为安全密钥）
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# 微信配置（请填写真实配置）
WECHAT_APPID=your_appid
WECHAT_SECRET=your_secret

# 第三方 AI API
THIRD_PARTY_API_BASE_URL=https://api.sendto.you
THIRD_PARTY_API_KEY=your_api_key

# R2 存储（请填写真实配置）
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket
R2_PUBLIC_BASE_URL=https://your-cdn.com

# 管理员 API Key
ADMIN_API_KEY=your_admin_api_key

# 每日生成限制
DAILY_LIMIT_NORMAL=10
DAILY_LIMIT_VIP=50
DAILY_LIMIT_SVIP=200

# 阿里云短信
SMS_MODE=aliyun
ALIYUN_SMS_ACCESS_KEY_ID=your_access_key
ALIYUN_SMS_ACCESS_KEY_SECRET=your_secret
ALIYUN_SMS_SIGN_NAME=your_sign
ALIYUN_SMS_TEMPLATE_CODE=your_template
EOF
        log_error "请编辑 $APP_DIR/backend/.env.production 填写真实配置"
    fi

    # 构建
    npm run build

    log_info "后端部署完成"
}

# =========================================
# 6. 部署管理后台
# =========================================
deploy_admin() {
    log_info "部署管理后台..."
    cd $APP_DIR/admin

    # 安装依赖
    npm ci

    # 创建环境配置
    cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN
EOF

    # 构建
    npm run build

    log_info "管理后台部署完成"
}

# =========================================
# 7. 配置 PM2 进程管理
# =========================================
setup_pm2() {
    log_info "配置 PM2..."

    # 创建 PM2 生态系统配置
    cat > $APP_DIR/ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'dream-backend',
      cwd: '$APP_DIR/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      env_file: '$APP_DIR/backend/.env.production',
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/dream-backend-error.log',
      out_file: '/var/log/pm2/dream-backend-out.log',
      merge_logs: true,
      time: true
    },
    {
      name: 'dream-admin',
      cwd: '$APP_DIR/admin',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p $ADMIN_PORT',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: $ADMIN_PORT
      },
      max_memory_restart: '300M',
      error_file: '/var/log/pm2/dream-admin-error.log',
      out_file: '/var/log/pm2/dream-admin-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
EOF

    # 创建日志目录
    mkdir -p /var/log/pm2

    # 启动应用
    cd $APP_DIR
    pm2 start ecosystem.config.js --env production

    # 保存 PM2 配置
    pm2 save

    # 设置开机启动
    pm2 startup systemd -u root --hp /root

    log_info "PM2 配置完成"
}

# =========================================
# 8. 配置 Nginx
# =========================================
setup_nginx() {
    log_info "配置 Nginx..."

    # 后端 API 配置
    cat > /etc/nginx/sites-available/$APP_NAME <<EOF
# 后端 API
server {
    listen 80;
    server_name $DOMAIN;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;

    # 请求体大小限制（用于图片上传）
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}

# 管理后台
server {
    listen 80;
    server_name $ADMIN_DOMAIN;

    access_log /var/log/nginx/${APP_NAME}_admin_access.log;
    error_log /var/log/nginx/${APP_NAME}_admin_error.log;

    location / {
        proxy_pass http://127.0.0.1:$ADMIN_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default

    # 测试配置
    nginx -t

    # 重启 Nginx
    systemctl restart nginx
    systemctl enable nginx

    log_info "Nginx 配置完成"
}

# =========================================
# 9. 配置 SSL（可选）
# =========================================
setup_ssl() {
    log_info "配置 SSL 证书..."

    # 使用 Certbot 获取证书
    certbot --nginx -d $DOMAIN -d $ADMIN_DOMAIN --non-interactive --agree-tos --email your-email@example.com

    # 设置自动续期
    systemctl enable certbot.timer
    systemctl start certbot.timer

    log_info "SSL 配置完成"
}

# =========================================
# 10. 系统优化（2GB 内存）
# =========================================
optimize_system() {
    log_info "优化系统配置..."

    # 配置 swap（如果没有）
    if [ ! -f /swapfile ]; then
        log_info "创建 2GB swap..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    # 优化内核参数
    cat >> /etc/sysctl.conf <<EOF

# 内存优化
vm.swappiness=10
vm.vfs_cache_pressure=50

# 网络优化
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=65535
EOF

    sysctl -p

    log_info "系统优化完成"
}

# =========================================
# 11. 防火墙配置
# =========================================
setup_firewall() {
    log_info "配置防火墙..."

    # 安装 ufw（如果没有）
    apt install -y ufw

    # 配置规则
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'

    # 启用防火墙
    ufw --force enable

    log_info "防火墙配置完成"
}

# =========================================
# 主函数
# =========================================
main() {
    echo "==========================================="
    echo "  Dream API 部署脚本 (Ubuntu 24.04)"
    echo "==========================================="
    echo ""

    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 用户运行此脚本"
        exit 1
    fi

    # 显示菜单
    echo "请选择操作："
    echo "1) 完整安装（首次部署）"
    echo "2) 仅更新代码"
    echo "3) 仅安装基础软件"
    echo "4) 仅配置 Nginx"
    echo "5) 仅配置 SSL"
    echo "6) 查看服务状态"
    echo "7) 重启所有服务"
    echo "0) 退出"
    echo ""
    read -p "请输入选项 [0-7]: " choice

    case $choice in
        1)
            log_info "开始完整安装..."
            optimize_system
            install_base
            install_postgresql
            install_redis
            deploy_app
            setup_pm2
            setup_nginx
            setup_firewall
            echo ""
            log_info "==========================================="
            log_info "部署完成！"
            log_info "==========================================="
            log_info "后端 API: http://$DOMAIN"
            log_info "管理后台: http://$ADMIN_DOMAIN"
            log_info ""
            log_warn "重要：请编辑 $APP_DIR/backend/.env.production 填写真实配置"
            log_warn "然后运行: pm2 restart all"
            log_info ""
            log_info "配置 SSL: $0 然后选择 5"
            ;;
        2)
            log_info "更新代码..."
            deploy_app
            pm2 restart all
            log_info "代码更新完成"
            ;;
        3)
            install_base
            install_postgresql
            install_redis
            ;;
        4)
            setup_nginx
            ;;
        5)
            setup_ssl
            ;;
        6)
            echo ""
            log_info "=== 服务状态 ==="
            pm2 status
            echo ""
            log_info "=== Nginx 状态 ==="
            systemctl status nginx --no-pager
            echo ""
            log_info "=== PostgreSQL 状态 ==="
            systemctl status postgresql --no-pager
            echo ""
            log_info "=== Redis 状态 ==="
            systemctl status redis-server --no-pager
            ;;
        7)
            log_info "重启所有服务..."
            pm2 restart all
            systemctl restart nginx
            systemctl restart redis-server
            systemctl restart postgresql
            log_info "所有服务已重启"
            ;;
        0)
            exit 0
            ;;
        *)
            log_error "无效选项"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
