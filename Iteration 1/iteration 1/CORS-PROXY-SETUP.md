# CORS代理服务部署指南

## 🚀 超简单！只需5分钟

### 📋 步骤1：准备文件

我已经为你准备好了所有文件：
- `cors-proxy-server.js` - 代理服务器代码
- `proxy-package.json` - 依赖配置

### 📋 步骤2：在Render部署代理服务

1. **创建新的Render服务**：
   - 访问 [Render Dashboard](https://dashboard.render.com)
   - 点击 "New +" → "Web Service"

2. **配置部署**：
   - **Repository**: 选择你的GitHub仓库（或手动上传文件）
   - **Name**: `your-cors-proxy` （任意名称）
   - **Runtime**: `Node`
   - **Build Command**: `npm install` 
   - **Start Command**: `node cors-proxy-server.js`
   - **Instance Type**: `Free` （免费够用）

3. **环境设置**：
   - **Root Directory**: 留空（或设为项目根目录）
   - **Node Version**: `18` 或更新

4. **部署文件准备**：
   ```bash
   # 将proxy-package.json重命名为package.json
   mv proxy-package.json package.json
   
   # 确保cors-proxy-server.js在根目录
   ```

### 📋 步骤3：获取代理服务URL

部署完成后，Render会给你一个URL，比如：
`https://your-cors-proxy.onrender.com`

### 📋 步骤4：更新前端代码

将第205行的代理URL替换为你的实际URL：

```javascript
// 将这行：
const proxyUrl = 'https://your-cors-proxy.onrender.com/api/image-detection';

// 改为你的实际URL：
const proxyUrl = 'https://你的代理服务名.onrender.com/api/image-detection';
```

### 📋 步骤5：重新部署前端

```bash
npm run build
git add .
git commit -m "Update to use custom CORS proxy"
git push
```

## ✅ 完成！

现在你的图像检测功能应该完美工作了！

## 🔍 测试方法

1. 检查代理服务：访问 `https://你的代理服务.onrender.com`
2. 应该看到：`{"status":"CORS Proxy Server is running"}`
3. 在前端上传图片测试

## 🛠️ 故障排除

如果遇到问题：
1. 检查Render服务日志
2. 确认代理URL正确
3. 检查浏览器控制台错误

## 💡 优势

- ✅ **完全可控** - 你的代理服务，不依赖第三方
- ✅ **免费** - Render免费计划足够使用  
- ✅ **稳定** - 不会像公共代理那样经常失效
- ✅ **快速** - 专门为你的后端优化
- ✅ **安全** - 只转发到你指定的后端地址
