# 🚀 ERP系统生产环境部署指南

## 📋 部署概览

本指南详细说明了ERP系统在生产环境中的部署流程，包括Kubernetes配置、Docker镜像构建、环境配置和监控设置。

## 🏗️ 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Ingress       │    │   Backend Pods  │
│                 │───▶│   Controller    │───▶│   (3 replicas)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   Database      │
                                              └─────────────────┘
```

## 📁 部署文件结构

```
deploy/
├── production/
│   ├── deployment.yml      # 后端部署配置
│   ├── service.yml         # 服务配置
│   ├── ingress.yml         # 入口配置
│   ├── configmap.yml       # 配置映射
│   ├── secrets.yml         # 密钥配置
│   └── namespace.yml       # 命名空间配置
├── staging/
│   └── ...                 # 预生产环境配置
├── docker/
│   ├── Dockerfile          # 后端Docker镜像
│   └── docker-compose.yml  # 本地开发环境
└── scripts/
    ├── build.sh            # 构建脚本
    ├── deploy.sh           # 部署脚本
    └── rollback.sh         # 回滚脚本
```

## 🐳 Docker镜像构建

### 后端Dockerfile

```dockerfile
# deploy/docker/Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置权限
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]
```

### 构建镜像

```bash
# 构建后端镜像
docker build -t erp-backend:1.0.0 -f deploy/docker/Dockerfile .

# 推送到镜像仓库
docker tag erp-backend:1.0.0 erp-registry.com/erp-backend:1.0.0
docker push erp-registry.com/erp-backend:1.0.0
```

## ☸️ Kubernetes部署

### 1. 创建命名空间

```bash
kubectl apply -f deploy/production/namespace.yml
```

### 2. 创建配置映射和密钥

```bash
# 创建配置映射
kubectl apply -f deploy/production/configmap.yml

# 创建密钥（注意：生产环境应使用更安全的方式）
kubectl apply -f deploy/production/secrets.yml
```

### 3. 部署应用

```bash
# 部署后端服务
kubectl apply -f deploy/production/deployment.yml

# 创建服务
kubectl apply -f deploy/production/service.yml

# 配置入口
kubectl apply -f deploy/production/ingress.yml
```

### 4. 验证部署

```bash
# 检查Pod状态
kubectl get pods -n erp-production

# 检查服务状态
kubectl get services -n erp-production

# 检查入口状态
kubectl get ingress -n erp-production

# 查看Pod日志
kubectl logs -f deployment/erp-backend -n erp-production
```

## 🔧 环境配置

### 配置映射 (ConfigMap)

```yaml
# deploy/production/configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: erp-config
  namespace: erp-production
data:
  NODE_ENV: production
  LOG_LEVEL: info
  DB_HOST: erp-postgres
  DB_PORT: "5432"
  DB_NAME: erp_prod
  REDIS_HOST: erp-redis
  CORS_ORIGIN: "https://erp.yourcompany.com"
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX_REQUESTS: "100"
```

### 密钥 (Secrets)

```yaml
# deploy/production/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: erp-secrets
  namespace: erp-production
type: Opaque
data:
  DB_USER: YWRtaW4=                    # admin (base64)
  DB_PASSWORD: c2VjcmV0cGFzc3dvcmQ=    # secretpassword (base64)
  JWT_SECRET: c3VwZXJzZWNyZXRqd3RrZXk= # supersecretjwtkey (base64)
  JWT_REFRESH_SECRET: cmVmcmVzaHNlY3JldA== # refreshsecret (base64)
```

## 📊 监控和日志

### 健康检查端点

```javascript
// 在server.js中添加健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});
```

### 日志配置

```javascript
// 配置结构化日志
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'erp-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🚀 部署脚本

### 自动化部署脚本

```bash
#!/bin/bash
# deploy/scripts/deploy.sh

set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
  echo "Usage: $0 <environment> <version>"
  echo "Example: $0 production 1.0.0"
  exit 1
fi

echo "🚀 开始部署 ERP 系统到 $ENVIRONMENT 环境，版本: $VERSION"

# 更新镜像版本
sed -i "s/image: erp-registry.com\/erp-backend:.*/image: erp-registry.com\/erp-backend:$VERSION/" deploy/$ENVIRONMENT/deployment.yml

# 应用配置
kubectl apply -f deploy/$ENVIRONMENT/

# 等待部署完成
kubectl rollout status deployment/erp-backend -n erp-$ENVIRONMENT

# 验证部署
kubectl get pods -n erp-$ENVIRONMENT
kubectl get services -n erp-$ENVIRONMENT

echo "✅ 部署完成！"
echo "🌐 访问地址: https://erp.yourcompany.com"
```

### 回滚脚本

```bash
#!/bin/bash
# deploy/scripts/rollback.sh

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: $0 <environment>"
  echo "Example: $0 production"
  exit 1
fi

echo "🔄 开始回滚 $ENVIRONMENT 环境"

# 回滚到上一个版本
kubectl rollout undo deployment/erp-backend -n erp-$ENVIRONMENT

# 等待回滚完成
kubectl rollout status deployment/erp-backend -n erp-$ENVIRONMENT

echo "✅ 回滚完成！"
```

## 🔒 安全配置

### 网络安全策略

```yaml
# deploy/production/network-policy.yml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: erp-network-policy
  namespace: erp-production
spec:
  podSelector:
    matchLabels:
      app: erp
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
```

### RBAC配置

```yaml
# deploy/production/rbac.yml
apiVersion: rbac.authorization.k8s.io/v1
kind: ServiceAccount
metadata:
  name: erp-service-account
  namespace: erp-production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: erp-role
  namespace: erp-production
rules:
- apiGroups: [""]
  resources: ["pods", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: erp-role-binding
  namespace: erp-production
subjects:
- kind: ServiceAccount
  name: erp-service-account
  namespace: erp-production
roleRef:
  kind: Role
  name: erp-role
  apiGroup: rbac.authorization.k8s.io
```

## 📈 性能优化

### 资源限制和请求

```yaml
# 在deployment.yml中配置资源
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### 水平Pod自动扩缩容 (HPA)

```yaml
# deploy/production/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: erp-backend-hpa
  namespace: erp-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: erp-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🚨 故障排除

### 常见问题

1. **Pod启动失败**
   ```bash
   kubectl describe pod <pod-name> -n erp-production
   kubectl logs <pod-name> -n erp-production
   ```

2. **服务无法访问**
   ```bash
   kubectl get endpoints -n erp-production
   kubectl describe service erp-backend-service -n erp-production
   ```

3. **配置问题**
   ```bash
   kubectl get configmap erp-config -n erp-production -o yaml
   kubectl get secret erp-secrets -n erp-production -o yaml
   ```

### 调试命令

```bash
# 进入Pod调试
kubectl exec -it <pod-name> -n erp-production -- /bin/sh

# 查看实时日志
kubectl logs -f deployment/erp-backend -n erp-production

# 查看资源使用情况
kubectl top pods -n erp-production
```

## 📋 部署检查清单

### 部署前检查
- [ ] Docker镜像已构建并推送
- [ ] 环境变量已配置
- [ ] 数据库连接已测试
- [ ] 密钥已正确设置
- [ ] 网络策略已配置

### 部署后验证
- [ ] Pod状态为Running
- [ ] 服务可正常访问
- [ ] 健康检查通过
- [ ] 日志正常输出
- [ ] 性能指标正常

### 上线后监控
- [ ] 错误率监控
- [ ] 响应时间监控
- [ ] 资源使用监控
- [ ] 业务指标监控

---

**注意**: 生产环境部署前请务必在测试环境充分验证，确保系统稳定性和安全性。
