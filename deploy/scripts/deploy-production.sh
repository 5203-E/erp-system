#!/bin/bash

# 🚀 ERP系统生产环境部署脚本
# 使用方法: ./deploy-production.sh <version> [--dry-run]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
NAMESPACE="erp-production"
DEPLOYMENT_NAME="erp-backend"
SERVICE_NAME="erp-backend-service"
INGRESS_NAME="erp-ingress"
VERSION=${1:-"1.0.0"}
DRY_RUN=${2:-""}

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ -z "$VERSION" ]; then
    log_error "请提供版本号"
    echo "使用方法: $0 <version> [--dry-run]"
    echo "示例: $0 1.0.0"
    exit 1
fi

# 检查kubectl
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl 未安装或不在PATH中"
    exit 1
fi

# 检查kubectl连接
if ! kubectl cluster-info &> /dev/null; then
    log_error "无法连接到Kubernetes集群"
    exit 1
fi

log_info "开始部署 ERP 系统到生产环境"
log_info "版本: $VERSION"
log_info "命名空间: $NAMESPACE"
log_info "部署名称: $DEPLOYMENT_NAME"

# 部署前检查
log_info "执行部署前检查..."

# 检查命名空间是否存在
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    log_info "创建命名空间: $NAMESPACE"
    kubectl create namespace $NAMESPACE
fi

# 检查集群资源
log_info "检查集群资源..."
NODE_COUNT=$(kubectl get nodes --no-headers | wc -l)
if [ $NODE_COUNT -lt 3 ]; then
    log_warning "集群节点数量较少 ($NODE_COUNT)，建议至少3个节点"
fi

# 检查存储类
if ! kubectl get storageclass &> /dev/null; then
    log_warning "未找到存储类，可能影响持久化存储"
fi

# 备份当前配置
log_info "备份当前配置..."
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

if kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE &> /dev/null; then
    kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o yaml > $BACKUP_DIR/deployment-backup.yaml
    kubectl get configmap erp-config -n $NAMESPACE -o yaml > $BACKUP_DIR/configmap-backup.yaml 2>/dev/null || true
    log_success "配置备份完成: $BACKUP_DIR"
else
    log_info "首次部署，无需备份"
fi

# 更新部署文件
log_info "更新部署配置..."
if [ "$DRY_RUN" = "--dry-run" ]; then
    log_info "DRY RUN 模式 - 仅显示更改"
    sed "s/image: erp-registry.com\/erp-backend:.*/image: erp-registry.com\/erp-backend:$VERSION/" deploy/production/deployment.yml
else
    # 更新镜像版本
    sed -i "s/image: erp-registry.com\/erp-backend:.*/image: erp-registry.com\/erp-backend:$VERSION/" deploy/production/deployment.yml
    log_success "镜像版本已更新为: $VERSION"
fi

# 应用Kubernetes配置
log_info "应用Kubernetes配置..."

if [ "$DRY_RUN" = "--dry-run" ]; then
    log_info "DRY RUN 模式 - 显示将要应用的配置"
    kubectl apply -f deploy/production/ --dry-run=client -n $NAMESPACE
else
    # 应用配置
    kubectl apply -f deploy/production/ -n $NAMESPACE
    log_success "Kubernetes配置已应用"
fi

# 等待部署完成
if [ "$DRY_RUN" != "--dry-run" ]; then
    log_info "等待部署完成..."
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=600s
    
    if [ $? -eq 0 ]; then
        log_success "部署完成！"
    else
        log_error "部署超时或失败"
        exit 1
    fi
fi

# 验证部署
log_info "验证部署结果..."

if [ "$DRY_RUN" != "--dry-run" ]; then
    # 检查Pod状态
    log_info "检查Pod状态..."
    kubectl get pods -n $NAMESPACE -l app=erp
    
    # 检查服务状态
    log_info "检查服务状态..."
    kubectl get services -n $NAMESPACE
    
    # 检查入口状态
    log_info "检查入口状态..."
    kubectl get ingress -n $NAMESPACE
    
    # 健康检查
    log_info "执行健康检查..."
    SERVICE_IP=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -n "$SERVICE_IP" ]; then
        log_info "服务IP: $SERVICE_IP"
        # 等待服务就绪
        sleep 30
        
        # 测试健康检查端点
        if curl -f "http://$SERVICE_IP/health" &> /dev/null; then
            log_success "健康检查通过"
        else
            log_warning "健康检查失败，请检查服务状态"
        fi
    else
        log_warning "无法获取服务IP，可能服务类型不是LoadBalancer"
    fi
fi

# 部署后检查
log_info "执行部署后检查..."

if [ "$DRY_RUN" != "--dry-run" ]; then
    # 检查资源使用情况
    log_info "检查资源使用情况..."
    kubectl top pods -n $NAMESPACE 2>/dev/null || log_warning "无法获取资源使用情况，可能需要安装metrics-server"
    
    # 检查日志
    log_info "检查应用日志..."
    kubectl logs deployment/$DEPLOYMENT_NAME -n $NAMESPACE --tail=20
    
    # 检查事件
    log_info "检查集群事件..."
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10
fi

# 部署完成
if [ "$DRY_RUN" = "--dry-run" ]; then
    log_info "DRY RUN 完成 - 未实际部署"
else
    log_success "🎉 ERP系统生产环境部署完成！"
    log_info "版本: $VERSION"
    log_info "命名空间: $NAMESPACE"
    log_info "访问地址: https://erp.yourcompany.com"
    log_info "监控地址: http://prometheus.yourcompany.com"
    log_info "日志地址: http://kibana.yourcompany.com"
fi

# 保存部署记录
DEPLOY_LOG="deploy-logs/deploy-$(date +%Y%m%d_%H%M%S).log"
mkdir -p deploy-logs
{
    echo "部署时间: $(date)"
    echo "版本: $VERSION"
    echo "命名空间: $NAMESPACE"
    echo "部署名称: $DEPLOYMENT_NAME"
    echo "DRY RUN: $DRY_RUN"
    echo "状态: 成功"
} > $DEPLOY_LOG

log_info "部署日志已保存: $DEPLOY_LOG"

# 显示后续步骤
if [ "$DRY_RUN" != "--dry-run" ]; then
    echo
    log_info "后续步骤:"
    echo "1. 监控系统性能和错误率"
    echo "2. 执行功能测试验证"
    echo "3. 检查业务指标"
    echo "4. 更新部署文档"
    echo
    log_info "如需回滚，请运行: ./rollback-production.sh"
fi
