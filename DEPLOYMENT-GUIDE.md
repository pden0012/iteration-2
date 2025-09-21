# HayFree 部署指南

## 问题诊断

您的网站 `https://iteration-2-underdeployment.onrender.com` 在加载地图树数据时出现404错误。经过分析，发现以下问题：

### 问题原因
1. **后端API正常**：`http://13.236.162.216:8080/map/tree` 端点工作正常，返回正确的树数据
2. **静态网站重写规则问题**：`_redirects` 文件的重写规则可能没有正确工作

## 解决方案

### 修复静态网站重写规则

Render.com静态网站支持通过 `_redirects` 文件直接重写API请求到后端服务器，无需部署额外的Web服务。

#### 步骤1：确保 `_redirects` 文件正确

文件内容应该是：
```
# Render.com Static Site Rewrite Rules
# This file tells Render how to handle API requests

# Rewrite API requests to backend
/api/map/* http://13.236.162.216:8080/map/:splat 200
/api/ai/* http://13.236.162.216:8080/ai/:splat 200

# Fallback for SPA routing - must be last
/* /index.html 200
```

#### 步骤2：重新部署静态网站

1. 确保 `_redirects` 文件在项目根目录
2. 重新构建和部署您的静态网站
3. Render.com会自动应用重写规则

## 验证修复

### 测试步骤

1. **访问地图页面**
   - 打开 `https://iteration-2-underdeployment.onrender.com/#map`
   - 检查浏览器开发者工具的控制台

2. **检查API请求**
   - 应该看到成功的API请求，而不是404错误
   - 地图上应该显示绿色和红色的树标记

3. **测试筛选功能**
   - 尝试不同的筛选选项（Show All, Show Only Safe, Show Only Risk）
   - 验证市政边界开关功能

### 预期结果

- ✅ 地图正常加载
- ✅ 树数据正确显示（绿色=安全，红色=风险）
- ✅ 筛选功能正常工作
- ✅ 市政边界正常显示/隐藏
- ✅ 控制台无错误信息

## 故障排除

### 如果仍然出现404错误

1. **检查CORS代理服务器状态**
   ```bash
   curl https://your-cors-proxy-url.onrender.com/health
   ```

2. **测试API端点**
   ```bash
   curl "https://your-cors-proxy-url.onrender.com/api/map/tree?zoom=12&bbox=-37.8,144.9,-37.7,145.0"
   ```

3. **检查环境变量**
   - 确认 `VITE_CORS_PROXY_URL` 已正确设置
   - 重新构建和部署前端

### 如果CORS错误仍然存在

1. **检查域名配置**
   - 确认CORS代理服务器允许您的域名
   - 更新 `cors-proxy-server.js` 中的 `allowedOrigins` 数组

2. **检查HTTPS证书**
   - 确保CORS代理服务器使用HTTPS
   - 检查证书是否有效

## 技术细节

### 修改的文件

1. **`cors-proxy-server.js`**
   - 添加了 `https://iteration-2-underdeployment.onrender.com` 到允许的域名列表

2. **`src/views/Map.vue`**
   - 更新了API URL构建逻辑，支持CORS代理服务器
   - 添加了环境变量支持

3. **`_redirects`**
   - 添加了SPA路由回退规则

4. **`README.md`**
   - 更新了环境变量配置说明

### API端点

- **地图数据**: `GET /api/map/tree?zoom={zoom}&bbox={bbox}&allergenicity={filter}`
- **图片分析**: `POST /api/ai/image`
- **健康检查**: `GET /health`

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器开发者工具的错误信息截图
2. CORS代理服务器的健康检查结果
3. 网络请求的详细信息

---

**注意**: 这个修复确保了您的HayFree网站能够正确加载墨尔本的过敏原树数据，为用户提供准确的安全和风险区域信息。
