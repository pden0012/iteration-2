# 快速测试代理服务器

## 测试步骤

### 1. 检查代理服务器是否存在
访问：https://hayfever-cors-proxy.onrender.com/health

如果返回：
```json
{
  "status": "OK",
  "service": "CORS Proxy Server"
}
```
说明代理服务器正常运行。

### 2. 测试CORS头
使用浏览器开发者工具，在Console中运行：
```javascript
fetch('https://hayfever-cors-proxy.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('代理服务器正常:', data))
  .catch(error => console.error('代理服务器错误:', error));
```

### 3. 测试地图API
```javascript
fetch('https://hayfever-cors-proxy.onrender.com/api/map/tree?zoom=12&bbox=-37.8,144.9,-37.7,145.0')
  .then(response => response.json())
  .then(data => console.log('地图数据:', data))
  .catch(error => console.error('地图API错误:', error));
```

## 如果代理服务器不存在

### 部署代理服务器：
1. 在Render.com创建新的Web Service
2. 名称：`hayfever-cors-proxy`
3. 构建命令：`npm install --production`
4. 启动命令：`node cors-proxy-server-simple.js`

### 如果部署失败：
检查Render日志，常见问题：
- 端口配置错误
- 依赖安装失败
- 启动命令错误

## 临时解决方案

如果代理服务器暂时无法部署，可以临时修改前端代码使用其他代理：

```javascript
// 在Map.vue中临时使用
return `https://api.allorigins.win/raw?url=${encodeURIComponent(backendUrl)}`;
```

```javascript
// 在ImageDetection.vue中临时使用
const proxyUrl = 'https://api.allorigins.win/raw?url=';
const backendUrl = 'http://13.236.162.216:8080/ai/image';
const requestUrl = `${proxyUrl}${encodeURIComponent(backendUrl)}`;
```
