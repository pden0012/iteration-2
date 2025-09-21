# Render.com 部署指南 / Render.com Deployment Guide

## 环境变量配置 / Environment Variables

在 Render.com 的部署设置中，请确保添加以下环境变量：

### 必需的环境变量 / Required Environment Variables

1. **VITE_GOOGLE_MAPS_API_KEY**
   - 描述：Google Maps JavaScript API 密钥
   - 获取方式：访问 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - 示例：`AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **VITE_API_BASE_URL** (可选 / Optional)
   - 描述：后端API基础URL
   - 默认值：会根据环境自动选择HTTP/HTTPS
   - 示例：`https://13.236.162.216:8080` 或 `http://13.236.162.216:8080`

### 配置步骤 / Setup Steps

1. 在 Render.com dashboard 中，进入你的项目设置
2. 找到 "Environment" 或"Environment Variables" 部分  
3. 添加上述环境变量
4. 点击保存并重新部署

## 部署配置 / Deployment Configuration

### 构建设置 / Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18 or latest

### 自动部署 / Auto Deploy
- 连接你的 GitHub 仓库
- 选择自动部署分支（通常是 `main` 或 `master`）

## 常见问题解决 / Troubleshooting

### 1. "Error loading tree data" 错误
**原因**：混合内容问题（HTTPS网站加载HTTP内容）或CORS跨域问题
**解决**：
- 确保后端API支持HTTPS，或者
- 使用代理/反向代理将HTTP请求转换为HTTPS，或者
- 代码已包含HTTP/HTTPS自动回退机制

### 2. Google Maps 不显示
**原因**：API密钥未配置或无效
**解决**：
- 检查 `VITE_GOOGLE_MAPS_API_KEY` 环境变量是否正确设置
- 确保API密钥已启用 "Maps JavaScript API"
- 检查API密钥的域名限制设置

### 3. 空白页面
**原因**：资源加载失败或JavaScript错误
**解决**：
- 检查浏览器控制台错误信息
- 确保所有资源文件正确上传
- 检查构建输出的完整性

### 4. 网络连接错误
**原因**：后端服务器不可访问或CORS配置问题
**解决**：
- 确保后端API服务器正常运行
- 检查后端CORS配置，允许来自Render域名的请求
- 检查后端服务器防火墙设置

## API服务器CORS配置建议 / Backend CORS Configuration

如果你控制后端API服务器，请确保CORS配置包含：

```javascript
// Express.js 示例
app.use(cors({
  origin: [
    'http://localhost:3000',           // 开发环境
    'https://your-app-name.onrender.com', // Render 生产环境
    // 添加其他允许的域名
  ],
  credentials: true
}));
```

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

- [ ] Google Maps API密钥已配置
- [ ] 环境变量已正确设置
- [ ] 构建配置正确（`npm run build`）
- [ ] 发布目录设置为 `dist`
- [ ] 后端API服务正常运行
- [ ] CORS配置包含Render域名
- [ ] 浏览器控制台无关键错误

完成以上检查后，你的应用应该能在Render上正常运行。
