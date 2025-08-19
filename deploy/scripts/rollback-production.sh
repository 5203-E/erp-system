#!/bin/bash

# 🔄 ERP系统生产环境回滚脚本
# 使用方法: ./rollback-production.sh [--force]

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
FORCE=${1:-""}

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

# 检查部署是否存在
if ! kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE &> /dev/null; then
    log_error "部署 $DEPLOYMENT_NAME 在命名空间 $NAMESPACE 中不存在"
    exit 1
fi

log_info "开始回滚 ERP 系统生产环境"
log_info "命名空间: $NAMESPACE"
log_info "部署名称: $DEPLOYMENT_NAME"

# 获取当前部署信息
log_info "获取当前部署信息..."
CURRENT_REVISION=$(kubectl rollout history deployment/$DEPLOYMENT_NAME -n $NAMESPACE --output=jsonpath='{.items[0].revision}')
PREVIOUS_REVISION=$(kubectl rollout history deployment/$DEPLOYMENT_NAME -n $NAMESPACE --output=jsonpath='{.items[1].revision}')

log_info "当前版本: $CURRENT_REVISION"
log_info "上一个版本: $PREVIOUS_REVISION"

# 获取当前镜像版本
CURRENT_IMAGE=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}')
log_info "当前镜像: $CURRENT_IMAGE"

# 获取上一个镜像版本
PREVIOUS_IMAGE=$(kubectl rollout history deployment/$DEPLOYMENT_NAME -n $NAMESPACE --revision=$PREVIOUS_REVISION -o jsonpath='{.spec.template.spec.containers[0].image}')
log_info "上一个镜像: $PREVIOUS_IMAGE"

# 确认回滚
if [ "$FORCE" != "--force" ]; then
    echo
    log_warning "即将回滚到上一个版本"
    echo "当前版本: $CURRENT_IMAGE"
    echo "回滚版本: $PREVIOUS_IMAGE"
    echo
    read -p "确认要回滚吗？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "回滚已取消"
        exit 0
    fi
fi

# 执行回滚
log_info "开始执行回滚..."

# 暂停部署
log_info "暂停部署..."
kubectl rollout pause deployment/$DEPLOYMENT_NAME -n $NAMESPACE

# 执行回滚
log_info "执行回滚到版本 $PREVIOUS_REVISION..."
kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE --to-revision=$PREVIOUS_REVISION

# 恢复部署
log_info "恢复部署..."
kubectl rollout resume deployment/$DEPLOYMENT_NAME -n $NAMESPACE

# 等待回滚完成
log_info "等待回滚完成..."
kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=600s

if [ $? -eq 0 ]; then
    log_success "回滚完成！"
else
    log_error "回滚超时或失败"
    exit 1
fi

# 验证回滚结果
log_info "验证回滚结果..."

# 检查Pod状态
log_info "检查Pod状态..."
kubectl get pods -n $NAMESPACE -l app=erp

# 检查服务状态
log_info "检查服务状态..."
kubectl get services -n $NAMESPACE

# 检查镜像版本
NEW_IMAGE=$(kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}')
log_info "回滚后镜像: $NEW_IMAGE"

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

# 检查资源使用情况
log_info "检查资源使用情况..."
kubectl top pods -n $NAMESPACE 2>/dev/null || log_warning "无法获取资源使用情况，可能需要安装metrics-server"

# 检查日志
log_info "检查应用日志..."
kubectl logs deployment/$DEPLOYMENT_NAME -n $NAMESPACE --tail=20

# 检查事件
log_info "检查集群事件..."
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -10

# 回滚完成
log_success "🔄 ERP系统生产环境回滚完成！"
log_info "回滚前版本: $CURRENT_IMAGE"
log_info "回滚后版本: $NEW_IMAGE"
log_info "命名空间: $NAMESPACE"

# 保存回滚记录
ROLLBACK_LOG="deploy-logs/rollback-$(date +%Y%m%d_%H%M%S).log"
mkdir -p deploy-logs
{
    echo "回滚时间: $(date)"
    echo "回滚前版本: $CURRENT_IMAGE"
    echo "回滚后版本: $NEW_IMAGE"
    echo "命名空间: $NAMESPACE"
    echo "部署名称: $DEPLOYMENT_NAME"
    echo "状态: 成功"
} > $ROLLBACK_LOG

log_info "回滚日志已保存: $ROLLBACK_LOG"

# 显示后续步骤
echo
log_info "后续步骤:"
echo "1. 监控系统性能和错误率"
echo "2. 执行功能测试验证"
echo "3. 检查业务指标"
echo "4. 分析回滚原因"
echo "5. 修复问题后重新部署"
echo
log_info "如需重新部署，请运行: ./deploy-production.sh <version>"

# 显示回滚历史
echo
log_info "部署历史:"
kubectl rollout history deployment/$DEPLOYMENT_NAME -n $NAMESPACE
