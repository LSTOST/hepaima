# Task 07 — 服务号H5问卷页

## 任务目标

在知我实验室微信服务号内开发一套H5问卷页面，用户关注服务号后可以直接在微信内完成依恋类型测试并自动收到报告，全程不离开微信生态。

完成后的用户流程：
```
用户关注服务号 → 发送任意消息 → 收到答题入口链接 
→ 微信内打开H5问卷 → 填写12道题 → 提交 
→ 30秒内服务号推送报告PDF链接
```

---

## 技术背景

- 服务号已认证，现有项目（合拍吗）已跑在服务号H5栈上
- 后端Python/FastAPI服务已部署在Railway（Task 01完成）
- 本Task在现有服务号项目里新增路由，复用已有的H5开发栈
- 后端分型和PDF生成逻辑完全复用Task 01的代码，不重复实现

---

## 前端：H5问卷页面

### 技术栈
复用现有合拍吗项目的技术栈（Next.js + TypeScript + Tailwind CSS）

### 新增路由
```
/attachment-test          # 问卷主入口
/attachment-test/result   # 提交完成页
```

### 页面流程

```
欢迎页 → 基本信息页 → 题目页（12页，每页1题）→ 提交中 → 完成页
```

### 欢迎页 `/attachment-test`

内容：
- 知我实验室Logo
- 标题：「了解你的依恋类型」
- 副标题：「12道题 · 5分钟 · 专属深度报告」
- 说明：「完成后报告将发送到此服务号，请保持关注」
- 按钮：「开始测试」→ 跳转基本信息页

### 基本信息页

字段：
- 昵称输入框（选填，placeholder：「给报告起个称呼，比如"小月"」）
- 联系方式输入框（必填，placeholder：「邮箱或微信号，用于备份接收」）
- 说明文字：「报告将优先通过服务号发送」
- 按钮：「开始答题」

### 题目页

- 每页显示1道题，共12页
- 顶部：进度条 + 「第 X 题 / 共 12 题」
- 题目文字居中，字号稍大
- 7个选项横排，圆形按钮，1-7
- 两端标签：「完全不符合」「完全符合」
- 选中后自动进入下一题，不需要额外确认按钮
- 底部：「上一题」文字按钮

题目顺序和内容：
```
第1题(A1)：我很担心自己会被另一半抛弃
第2题(A2)：我需要对方经常表达对我的感情，才能感到安心
第3题(A3)：如果对方没有及时回消息，我会开始胡思乱想
第4题(A4)：当对方显得疏远时，我会变得焦虑或愤怒
第5题(A5)：我比大多数人更担心感情不够稳固
第6题(A6)：我总是觉得自己对感情投入得比对方多
第7题(B1)：我不太舒适于向伴侣倾诉内心深处的想法和感受
第8题(B2)：在关系中过于亲密会让我感到不自在
第9题(B3)：我倾向于不依赖任何人，靠自己解决问题
第10题(B4)：需要别人会让我感到有点不舒服
第11题(B5)：当伴侣想要在情感上更亲近时，我会有些退缩
第12题(B6)：我在感情中不太擅长表达脆弱和需求
```

### 提交中页

- 不用spinner
- 文字：「正在生成你的依恋报告…」
- 副文字：「通常需要30秒左右，请稍候」
- 调用后端API提交答题数据，等待响应
- 响应成功后自动跳转完成页

### 完成页 `/attachment-test/result`

- 标题：「报告已生成」
- 正文：「请返回知我实验室服务号，报告链接已发送」
- 小字：「如未收到，请在服务号内发送"报告"重新获取」
- 不放任何其他引流内容

---

## 前端提交API调用规格

提交时调用Railway后端的新端点（见后端部分），请求格式：

```typescript
// POST https://你的Railway域名/quiz/submit
const payload = {
  nickname: string,        // 昵称，可为空字符串
  contact: string,         // 邮箱或微信号
  openid: string,          // 从微信JSSDK获取，用于服务号推送
  answers: {
    A1: number,            // 1-7
    A2: number,
    A3: number,
    A4: number,
    A5: number,
    A6: number,
    B1: number,
    B2: number,
    B3: number,
    B4: number,
    B5: number,
    B6: number,
  }
}
```

**关于openid获取：**
用户在微信内打开H5页面时，通过微信网页授权获取openid（静默授权，用户无感知）：
- 授权scope：`snsapi_base`（只获取openid，不需要用户信息）
- 在页面加载时先完成授权，拿到openid后再渲染问卷内容
- openid用于后端通过客服消息API向用户推送报告链接

微信网页授权流程：
```
页面加载 → 检查URL是否有code参数
→ 没有code：跳转微信授权页（redirect_uri=当前页面URL）
→ 有code：调用后端换取openid
→ 拿到openid：继续渲染页面
```

---

## 后端：新增接口和微信推送

在Task 01的FastAPI项目里新增以下内容：

### 新增端点1：换取openid

```
GET /wechat/oauth?code={code}
```

用微信授权code换取openid：
- 调用微信API：`https://api.weixin.qq.com/sns/oauth2/access_token`
- 参数：appid、secret、code、grant_type=authorization_code
- 返回：`{"openid": "xxx"}`
- openid不存入数据库，直接返回给前端，前端提交时带上

### 新增端点2：问卷提交

```
POST /quiz/submit
```

请求体同上述前端payload格式。

处理流程（异步，立刻返回200）：
```
接收数据 → 验证字段完整性 
→ 立刻返回 {"status": "processing"}
→ 后台异步执行：
   classifier（复用Task 01）
   → report_builder（复用Task 01）
   → pdf_generator（复用Task 01）
   → storage（复用Task 01）
   → 用客服消息API向openid推送报告链接
   → 如果有邮箱，同时发邮件（备份）
```

### 新增模块：wechat_pusher.py

实现向用户主动推送客服消息：

```python
# 调用微信客服消息接口
# POST https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={token}

def send_report_link(openid: str, download_url: str, nickname: str) -> bool:
    """
    发送报告链接给用户
    消息格式：文本消息
    内容：
    {nickname}，你的依恋类型报告已生成 ✨
    
    点击下载报告（7天内有效）：
    {download_url}
    
    —— 知我实验室
    """
```

**注意事项：**
- 客服消息需要access_token，access_token有效期2小时，需要缓存（用内存缓存即可，不需要Redis）
- 只有用户在48小时内与服务号有过互动，才能收到客服消息
- 用户关注服务号后发送任意消息，即视为互动，48小时窗口重置
- 如果推送失败（超过48小时窗口），记录日志，依赖邮件备份

### 新增端点3：微信服务号消息接收

```
GET  /wechat/callback   # 微信服务器验证（首次配置时用）
POST /wechat/callback   # 接收用户发来的消息
```

处理逻辑：
- 用户关注服务号时（Event=subscribe）：回复欢迎消息 + 答题链接
- 用户发送任意文字时：回复答题链接
- 用户发送"报告"时：如果能找到最近一次的生成记录则重发链接，否则回复引导去答题

欢迎消息内容：
```
你好！我是知我实验室 👋

点击下方链接，开始你的依恋类型测试：
{H5问卷URL}

完成后报告将自动发送到此对话。
```

### 新增环境变量

```
WECHAT_APPID=服务号的AppID
WECHAT_APPSECRET=服务号的AppSecret
WECHAT_TOKEN=自定义Token（用于服务器验证，随便设一个字符串）
H5_BASE_URL=H5问卷的域名（如 https://xxx.vercel.app）
```

---

## 微信服务号后台配置（你手动操作，不是Cursor做的）

Cursor完成代码后，你需要在微信公众平台做以下配置：

1. **服务器配置**
   - 登录 mp.weixin.qq.com
   - 设置与开发 → 基本配置 → 服务器配置
   - URL填：`https://你的Railway域名/wechat/callback`
   - Token填：和环境变量WECHAT_TOKEN一致
   - 消息加解密方式：明文模式（MVP阶段够用）
   - 提交验证

2. **网页授权域名配置**
   - 设置与开发 → 公众号设置 → 功能设置
   - 网页授权域名：填H5问卷的域名（不带https://）

3. **JS接口安全域名**（如果用到JSSDK）
   - 同上位置，JS接口安全域名填同一个域名

---

## 完成标准

- [ ] 微信内打开H5链接，能正常渲染问卷页面（不是空白）
- [ ] 12道题全部填完，提交后页面跳转到完成页
- [ ] Railway logs显示处理日志（classifier → storage → pusher）
- [ ] 服务号内收到报告链接消息（30秒内）
- [ ] 点击链接能下载PDF，中文正常显示
- [ ] 用户关注服务号时自动收到欢迎消息和答题链接
- [ ] 所有新增环境变量已更新到.env.example

---

## 不在这个Task里做的事

- 付费验证（验证用户是否付款才能答题）——MVP阶段靠人工发链接控制，不做系统验证
- 报告历史记录查询
- 用户管理后台
- 微信支付
