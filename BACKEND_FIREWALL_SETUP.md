# 后端防火墙配置指南 - 允许Render访问

## 📋 问题说明

您的Render部署无法访问后端API服务器 `http://3.106.197.188:8080`，出现502 Bad Gateway错误。

**原因**：后端服务器的防火墙阻止了来自Render的请求。

**解决方案**：在后端服务器的防火墙/安全组中添加Render的IP地址到白名单。

---

## 🎯 方案一：AWS EC2 安全组配置（推荐）

### 步骤1：登录AWS控制台

1. 访问 [AWS Console](https://console.aws.amazon.com/)
2. 登录您的AWS账户
3. 选择**亚太地区（悉尼）ap-southeast-2** 区域（因为IP是3.106.x.x）

### 步骤2：找到EC2实例的安全组

1. 进入 **EC2 Dashboard**
2. 在左侧菜单选择 **"Instances"**（实例）
3. 搜索或找到IP为 `3.106.197.188` 的实例
4. 点击该实例，查看下方的 **"Security"**（安全）标签
5. 记下 **Security groups**（安全组）的名称，例如：`sg-0abc123def456`

### 步骤3：修改安全组入站规则

1. 在左侧菜单点击 **"Security Groups"**（安全组）
2. 找到上一步记录的安全组
3. 选中该安全组，点击下方的 **"Inbound rules"**（入站规则）标签
4. 点击 **"Edit inbound rules"**（编辑入站规则）按钮

### 步骤4：添加新规则

点击 **"Add rule"**（添加规则），填写以下信息：

#### 测试配置（临时，允许所有IP访问）：
```
Type（类型）:        Custom TCP
Protocol（协议）:    TCP
Port range（端口）:  8080
Source（来源）:      0.0.0.0/0
Description（描述）: Render deployment access - temporary
```

#### 或者，生产配置（更安全）：
如果您有Render的静态IP，使用：
```
Type（类型）:        Custom TCP
Protocol（协议）:    TCP
Port range（端口）:  8080
Source（来源）:      [Render的IP地址]/32
Description（描述）: Render deployment access
```

### 步骤5：保存并测试

1. 点击 **"Save rules"**（保存规则）
2. 等待1-2分钟让规则生效
3. 访问 `https://iteration-2-hayfree.onrender.com/#map`
4. 检查地图是否能加载树木数据

---

## 🎯 方案二：使用AWS CLI 配置（命令行）

如果您熟悉命令行，可以使用以下命令：

### 1. 查找安全组ID

```bash
aws ec2 describe-instances \
  --region ap-southeast-2 \
  --filters "Name=ip-address,Values=3.106.197.188" \
  --query 'Reservations[*].Instances[*].SecurityGroups[*].[GroupId,GroupName]' \
  --output table
```

### 2. 添加入站规则

```bash
# 替换 sg-XXXXXXXXX 为实际的安全组ID
aws ec2 authorize-security-group-ingress \
  --region ap-southeast-2 \
  --group-id sg-XXXXXXXXX \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0
```

### 3. 验证规则

```bash
aws ec2 describe-security-groups \
  --region ap-southeast-2 \
  --group-ids sg-XXXXXXXXX \
  --query 'SecurityGroups[*].IpPermissions' \
  --output table
```

---

## 🎯 方案三：获取Render的静态IP（付费计划）

如果您使用的是Render付费计划，可以获取静态IP：

### 步骤1：联系Render支持

1. 访问 [Render Support](https://render.com/docs/static-outbound-ip-addresses)
2. 查看您的服务是否支持静态出站IP
3. 如果支持，在Render Dashboard中查看您的静态IP地址

### 步骤2：使用静态IP配置防火墙

将Render提供的静态IP地址添加到安全组规则中：

```
Source（来源）: [Render静态IP]/32
```

例如：
```
Source: 52.54.123.45/32
```

---

## 🎯 方案四：临时测试配置

### 快速测试步骤（仅用于验证问题）

如果您只是想快速测试问题是否是防火墙导致的：

1. **临时开放端口8080给所有IP**
   - 在AWS安全组中添加：`0.0.0.0/0` 允许端口 8080
   
2. **测试Render部署**
   - 访问：`https://iteration-2-hayfree.onrender.com/#map`
   - 检查是否能正常加载数据

3. **如果成功，说明确实是防火墙问题**
   - 然后限制访问范围到Render的IP
   - 或者保持开放（如果是公开API）

⚠️ **安全提醒**：开放 `0.0.0.0/0` 意味着任何人都可以访问您的API。如果API包含敏感数据，请使用更严格的IP限制。

---

## 📊 配置完成后的验证

### 1. 在Render上测试

访问：`https://iteration-2-hayfree.onrender.com/#map`

应该看到：
- ✅ 地图正常显示
- ✅ 树木标记正常加载
- ✅ 没有502错误

### 2. 检查浏览器控制台

打开浏览器开发者工具（F12），查看Console标签：
- ✅ 应该看到 "Received data:" 日志
- ✅ 没有 "Bad Gateway (502)" 错误
- ✅ API请求返回 200 状态码

### 3. 测试API端点

直接测试API：
```bash
curl -v https://iteration-2-hayfree.onrender.com/api/map/tree?zoom=12&bbox=-37.882189,144.803112,-37.744947,145.123088
```

应该返回：
```
< HTTP/1.1 200 OK
{"code":1,"msg":null,"data":[...]}
```

---

## 🆘 常见问题

### Q1: 我没有AWS控制台访问权限怎么办？

**A**: 联系后端服务器的管理员或DevOps团队，提供以下信息：
- 需要访问的服务器：`3.106.197.188`
- 需要开放的端口：`8080`
- 请求来源：Render.com 部署
- 临时解决方案：允许所有IP（`0.0.0.0/0`）访问端口8080

### Q2: 添加规则后还是502错误？

**A**: 检查以下几点：
1. 等待2-3分钟让规则生效
2. 确认端口号是 `8080` 而不是其他
3. 确认协议是 `TCP`
4. 检查是否有多个安全组，确保修改了正确的那个
5. 查看EC2实例本身是否在运行：`curl http://3.106.197.188:8080/map/tree`

### Q3: 如何知道Render使用的具体IP地址？

**A**: 
- 免费计划：IP地址动态变化，建议使用 `0.0.0.0/0` 或升级到付费计划
- 付费计划：在Render Dashboard查看静态IP地址
- 或在服务器日志中查看请求来源IP

### Q4: 后端不是AWS EC2，是其他服务器怎么办？

**A**: 根据服务器类型配置防火墙：

- **Azure VM**: 配置 Network Security Group (NSG)
- **Google Cloud**: 配置 Firewall Rules
- **DigitalOcean**: 配置 Cloud Firewalls
- **自建服务器**: 配置 iptables 或 firewalld
- **Nginx**: 配置 nginx.conf 的 allow/deny 指令

---

## 📞 需要帮助？

- **AWS支持**: https://console.aws.amazon.com/support/
- **Render文档**: https://render.com/docs
- **Render支持**: support@render.com
- **后端服务器管理员**: 联系管理 `3.106.197.188` 的团队成员

---

## ✅ 配置检查清单

完成以下步骤后打勾：

- [ ] 找到后端服务器 `3.106.197.188` 的安全组
- [ ] 添加入站规则：TCP 端口 8080
- [ ] 配置来源IP（测试用 `0.0.0.0/0` 或 Render静态IP）
- [ ] 保存规则并等待生效
- [ ] 测试Render部署：访问地图页面
- [ ] 验证没有502错误
- [ ] 确认树木数据正常加载
- [ ] （可选）限制IP范围提高安全性

---

**最后更新**: 2025-10-10
**相关文件**: `get-render-ip.js`, `README.md`

