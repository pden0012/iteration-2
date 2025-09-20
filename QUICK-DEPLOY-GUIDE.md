# 快速部署CORS代理服务器到Render.com

## 问题诊断
从控制台错误可以看出：
- `hayfever-cors-proxy.onrender.com` 没有返回正确的CORS头
- 说明代理服务器要么没有部署，要么CORS配置有问题

## 解决方案

### 方案1：使用简化版代理服务器（推荐）

1. **在Render.com创建新服务**：
   - 服务名：`hayfever-cors-proxy`
   - 环境：Node.js
   - 构建命令：`npm install --production`
   - 启动命令：`node cors-proxy-server-simple.js`

2. **使用简化版文件**：
   - 主文件：`cors-proxy-server-simple.js`
   - 依赖：`proxy-package.json`

### 方案2：修复现有代理服务器

如果已经部署了，需要重新部署修复后的版本。

## 部署步骤

### 1. 准备文件
确保以下文件在GitHub仓库中：
- `cors-proxy-server-simple.js` ✅
- `proxy-package.json` ✅

### 2. 在Render.com部署
1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 "New +" → "Web Service"
3. 连接GitHub仓库
4. 配置：
   ```
   Name: hayfever-cors-proxy
   Environment: Node
   Build Command: npm install --production
   Start Command: node cors-proxy-server-simple.js
   ```

### 3. 等待部署
- 部署时间：2-5分钟
- 成功后获得URL：`https://hayfever-cors-proxy.onrender.com`

### 4. 测试代理服务器
访问：`https://hayfever-cors-proxy.onrender.com/health`

应该看到：
```json
{
  "status": "OK",
  "service": "CORS Proxy Server",
  "cors": "Enabled for all origins"
}
```

## 验证步骤

### 1. 测试健康检查
```bash
curl https://hayfever-cors-proxy.onrender.com/health
```

### 2. 测试CORS头
```bash
curl -H "Origin: https://iteration-2.onrender.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://hayfever-cors-proxy.onrender.com/api/map/tree
```

应该返回CORS头：
```
Access-Control-Allow-Origin: https://iteration-2.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## 如果仍然失败

### 检查Render日志
1. 进入Render Dashboard
2. 选择 `hayfever-cors-proxy` 服务
3. 查看 "Logs" 标签
4. 检查是否有错误信息

### 常见问题
1. **端口问题**：Render自动设置PORT环境变量
2. **依赖问题**：确保所有依赖都在package.json中
3. **启动问题**：检查启动命令是否正确

### 备用方案
如果自建代理仍有问题，可以临时使用：
```javascript
// 在前端代码中临时使用
const proxyUrl = 'https://api.allorigins.win/raw?url=';
const backendUrl = 'http://13.236.162.216:8080/ai/image';
const requestUrl = `${proxyUrl}${encodeURIComponent(backendUrl)}`;
```

## 成功标志
- 健康检查返回200
- CORS头正确设置
- 前端不再报CORS错误
- 图片分析和地图功能正常工作
