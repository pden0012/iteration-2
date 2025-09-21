# Render.com 部署指南 / Render.com Deployment Guide

## 重要配置 / Critical Configuration

### 1. Render Rewrite 配置 (必需!)

在Render dashboard中，进入你的服务设置，找到 **Redirects/Rewrites** 部分，添加以下规则：

- **Source**: `/api/*`
- **Destination**: `http://13.236.162.216:8080/:splat`
- **Action Type**: **Rewrite** (⚠️ 注意：必须是 Rewrite，不是 Redirect)
- **Preserve query string**: ✅ 勾选

这个配置会将前端的 `/api/*` 请求代理到后端服务器，避免Mixed Content错误。

### 2. 环境变量配置 / Environment Variables

在 Render.com 的部署设置中，请确保添加以下环境变量：

#### 必需的环境变量 / Required Environment Variables

1. **VITE_GOOGLE_MAPS_API_KEY** (必需!)
   - 描述：Google Maps JavaScript API 密钥
   - 获取方式：访问 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - 示例：`AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **VITE_API_BASE_URL** (仅开发环境需要 / Development Only)
   - 描述：本地开发时的后端API基础URL
   - 生产环境通过Rewrite代理，无需设置此变量
   - 示例：`http://13.236.162.216:8080`

### 配置步骤 / Setup Steps

1. 在 Render.com dashboard 中，进入你的项目设置
2. **配置Rewrite规则 (最重要!)**：
   - 找到 "Redirects and Rewrites" 部分
   - 添加上述的 `/api/*` Rewrite 规则
3. **配置环境变量**：
   - 找到 "Environment" 或"Environment Variables" 部分  
   - 添加 `VITE_GOOGLE_MAPS_API_KEY`
4. 点击保存并重新部署

## 工作原理 / How It Works

### API请求流程

1. **本地开发**：前端直接请求 `http://13.236.162.216:8080/map/tree?...`
2. **生产环境**：
   - 前端请求：`https://your-app.onrender.com/api/map/tree?...`
   - Render Rewrite：自动转发到 `http://13.236.162.216:8080/map/tree?...`
   - 浏览器只看到同源HTTPS请求，无Mixed Content问题

### 为什么这样做？

- **解决Mixed Content**：HTTPS网站不能直接请求HTTP API
- **避免CORS问题**：同源请求不需要CORS配置
- **简化部署**：无需修改后端服务器配置

## 部署配置 / Deployment Configuration

### 构建设置 / Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18 or latest

### 自动部署 / Auto Deploy
- 连接你的 GitHub 仓库
- 选择自动部署分支（通常是 `main` 或 `master`）

## 验证部署 / Verify Deployment

### 检查API请求是否正确代理

1. 打开浏览器开发工具 → Network 面板
2. 刷新页面，观察API请求
3. 应该看到请求URL是：`https://your-app.onrender.com/api/map/tree?...`
4. 如果还看到 `http://13.236...` 请求，说明代码或配置有问题

## 常见问题解决 / Troubleshooting

### 1. "Error loading tree data" 错误
**可能原因**：
- Render Rewrite 规则未配置或配置错误
- 后端API服务器不可访问
- Google Maps API密钥未配置

**解决步骤**：
1. 检查 Render Rewrite 配置是否正确
2. 确保后端API服务器正常运行
3. 检查浏览器Network面板，确认API请求走的是 `/api/*` 路径

### 2. Google Maps 不显示
**原因**：API密钥未配置或无效
**解决**：
- 检查 `VITE_GOOGLE_MAPS_API_KEY` 环境变量是否正确设置
- 确保API密钥已启用 "Maps JavaScript API"
- 检查API密钥的域名限制设置，添加你的Render域名

### 3. API请求仍然直接访问IP地址
**原因**：代码判断环境的逻辑有问题
**解决**：
- 检查代码中 `window.location.hostname` 的判断逻辑
- 确保生产环境走 `/api/*` 路径

### 4. Rewrite 不生效
**常见错误**：
- 使用了 Redirect 而不是 Rewrite
- Source 路径写错（应该是 `/api/*`）
- Destination 路径写错（应该是 `http://13.236.162.216:8080/:splat`）

**解决**：重新检查Rewrite配置，确保Action Type是"Rewrite"

## API服务器配置 / Backend Server Configuration

### CORS配置 (可选)

使用Render Rewrite后，生产环境的API请求是通过代理转发的，不需要特殊的CORS配置。

如果你需要支持本地开发环境的直接API访问，可以在后端配置CORS：

```javascript
// Express.js 示例 (仅用于本地开发)
app.use(cors({
  origin: [
    'http://localhost:3000',      // 本地开发环境
    'http://127.0.0.1:3000',     // 本地开发环境
  ]
}));
```

**注意**：生产环境使用Rewrite代理，无需在CORS中添加Render域名。

## 性能优化建议 / Performance Optimization

1. **启用压缩**：Render 会自动压缩静态文件
2. **缓存策略**：合理设置缓存头
3. **图片优化**：使用适当格式和大小的图片
4. **代码分割**：Vite 已自动进行代码分割

## 监控和调试 / Monitoring and Debugging

1. **查看部署日志**：在 Render dashboard 中查看构建和部署日志
2. **运行时日志**：查看浏览器控制台获取运行时错误
3. **网络监控**：使用浏览器开发工具监控网络请求

## 备用解决方案 / Fallback Solutions

如果直接连接后端API仍有问题，可以考虑：

1. **使用代理服务**：创建一个中间层来转发API请求
2. **HTTPS证书**：为后端API配置HTTPS证书
3. **CDN加速**：使用CDN来加速API访问

---

## 快速部署检查清单 / Quick Deployment Checklist

### Render 配置
- [ ] **Rewrite 规则已配置** (`/api/*` → `http://13.236.162.216:8080/:splat`)
- [ ] Action Type 设置为 **Rewrite** (不是Redirect)
- [ ] Preserve query string 已勾选
- [ ] Google Maps API密钥已配置 (`VITE_GOOGLE_MAPS_API_KEY`)
- [ ] 构建配置正确 (Build Command: `npm run build`, Publish Directory: `dist`)

### 验证部署
- [ ] 后端API服务正常运行
- [ ] 浏览器Network面板显示API请求路径是 `/api/*`
- [ ] 地图正常显示，无Mixed Content错误
- [ ] 浏览器控制台无关键错误

### 常见错误检查
- [ ] 确认没有直接访问 `http://13.236...` 的请求
- [ ] Google Maps API密钥有效且已启用Maps JavaScript API
- [ ] 域名限制包含你的Render域名

完成以上检查后，你的应用应该能在Render上正常运行！
