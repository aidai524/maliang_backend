#!/bin/bash

# Dream API 快速部署脚本
# 用法: ./deploy.sh [环境]
# 示例: ./deploy.sh prod

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

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        echo "安装命令: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_info "Docker 环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f "backend/.env.production" ]; then
        log_warn "未找到 backend/.env.production 文件"
        if [ -f "backend/.env.example" ]; then
            log_info "复制 .env.example 为 .env.production"
            cp backend/.env.example backend/.env.production
            log_warn "请编辑 backend/.env.production 配置生产环境变量"
            exit 1
        fi
    fi
    log_info "环境变量文件检查通过"
}

# 构建并启动服务
deploy() {
    log_info "开始部署..."
    
    # 使用 docker compose (v2) 或 docker-compose (v1)
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    # 构建镜像
    log_info "构建 Docker 镜像..."
    $COMPOSE_CMD -f docker-compose.prod.yml build
    
    # 启动服务
    log_info "启动服务..."
    $COMPOSE_CMD -f docker-compose.prod.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    log_info "检查服务状态..."
    $COMPOSE_CMD -f docker-compose.prod.yml ps
    
    # 健康检查
    log_info "执行健康检查..."
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        log_info "后端服务运行正常 ✓"
    else
        log_warn "后端服务可能还在启动中，请稍后检查"
    fi
    
    echo ""
    log_info "部署完成！"
    echo ""
    echo "服务地址："
    echo "  - 后端 API:  http://localhost:3000"
    echo "  - Admin 面板: http://localhost:3002"
    echo "  - API 文档:  http://localhost:3000/api/docs"
    echo ""
    echo "常用命令："
    echo "  查看日志:    $COMPOSE_CMD -f docker-compose.prod.yml logs -f"
    echo "  重启服务:    $COMPOSE_CMD -f docker-compose.prod.yml restart"
    echo "  停止服务:    $COMPOSE_CMD -f docker-compose.prod.yml down"
    echo "  数据库迁移:  $COMPOSE_CMD -f docker-compose.prod.yml exec backend npm run migration:run"
}

# 停止服务
stop() {
    log_info "停止服务..."
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.prod.yml down
    else
        docker-compose -f docker-compose.prod.yml down
    fi
    log_info "服务已停止"
}

# 查看日志
logs() {
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.prod.yml logs -f
    else
        docker-compose -f docker-compose.prod.yml logs -f
    fi
}

# 主函数
main() {
    case "${1:-deploy}" in
        deploy)
            check_docker
            check_env
            deploy
            ;;
        stop)
            stop
            ;;
        logs)
            logs
            ;;
        restart)
            stop
            deploy
            ;;
        *)
            echo "用法: $0 {deploy|stop|logs|restart}"
            exit 1
            ;;
    esac
}

main "$@"
