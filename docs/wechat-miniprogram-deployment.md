# 合拍吗 - 微信小程序部署方案

当前合拍吗是 **Next.js 网页应用**，微信小程序使用 **自己的运行环境**（WXML/WXSS/JS），不能直接把 Next.js 部署成小程序。可选三种思路：

---

## 方案对比

| 方案 | 工作量 | 体验 | 适用阶段 |
|------|--------|------|----------|
| **一、web-view 内嵌 H5** | 小 | 接近 H5，部分能力受限 | 快速上线、验证转化 |
| **二、Taro/uni-app 多端编译** | 大 | 原生级体验，一套代码多端 | 中长期、要小程序原生能力 |
| **三、小程序原生重写** | 最大 | 最好 | 仅当必须深度定制时 |

---

## 方案一：web-view 内嵌现有 H5（推荐先做）

小程序只做「壳」，用 `<web-view>` 打开合拍吗的网页，**不改现有 Next.js 代码**即可上线。

### 1. 注册小程序并创建项目

1. 登录 [微信公众平台](https://mp.weixin.qq.com/) → 小程序 → 注册（需企业/个体户，个人主体小程序**不支持** web-view）。
2. 在 [微信公众平台](https://mp.weixin.qq.com/) → 开发 → 开发管理 → 开发设置 中拿到 **AppID**。
3. 用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 新建「小程序」项目，填好 AppID。

### 2. 小程序端只做入口页 + web-view

在开发者工具里，例如只有两个文件即可：

**`app.json`**（入口与权限）：

```json
{
  "pages": ["pages/index/index"],
  "window": {
    "navigationBarTitleText": "合拍吗"
  }
}
```

**`pages/index/index.wxml`**：

```html
<web-view src="https://hepaima.com/"></web-view>
```

**`pages/index/index.js`**（可为空或只写 `Page({})`）。

生产环境请把 `https://hepaima.com/` 换成你的正式域名（如 `https://hepaima.kyx123.com`）。

### 3. 配置业务域名（必做）

否则 web-view 会报「不在以下 request 合法域名列表中」或无法打开。

1. 小程序后台 → **开发** → **开发管理** → **开发设置** → **业务域名**。
2. 点击「开始配置」，按提示下载校验文件。
3. 把校验文件放到你 **H5 站点根目录**（例如 `https://hepaima.com/xxx.txt` 能访问），在后台填写域名并保存。
4. 域名需 **已备案**、**HTTPS**；合拍吗当前域名若已满足可直接用。

配置完成后，`<web-view src="https://你的域名/">` 才能正常打开。

### 4. 支付与登录在小程序内的注意点

- **当前 H5**：在微信浏览器里用 **公众号 JSAPI 支付** + OAuth 拿 openid，逻辑已在 `src/app/result/[sessionId]/page.tsx` 等处实现。
- **web-view 内**：仍算「微信内浏览器」，你现有 **JSAPI 支付 + 公众号 OAuth** 一般可继续用；需确保公众号与小程序是**同一开放平台账号**下关联的，且支付用的 AppID 是公众号 AppID。
- 若希望**在小程序内用小程序支付**：需在小程序侧调 `wx.requestPayment`，由你后端为「小程序」单独下一笔单（小程序支付需传 `openid`，且为小程序 AppID 下的 openid），当前后端是公众号/ H5 的 openid，要扩成支持「小程序 openid」并区分支付场景（H5 JSAPI vs 小程序支付）。

若先不改支付，仅用 web-view 展示 H5，用户在小程序里打开 H5 后流程与在公众号里一致即可。

### 5. 发布

- 开发者工具 → 上传 → 小程序后台「版本管理」中选为体验版/提交审核 → 审核通过后发布。

**优点**：几乎零前端改造成本，后端可沿用现有接口。  
**缺点**：分享、部分能力依赖 web-view 与小程序通信；个人类型小程序不能用 web-view。

---

## 方案二：Taro / uni-app 多端编译

用 **Taro** 或 **uni-app** 写一套代码，编译出 **H5 + 微信小程序**（以及后续 App），前端需按框架重写，**后端 API 可继续用**。

### 技术选型

- **Taro 3/4**：React 语法，与当前 Next.js 技术栈接近，组件和状态逻辑可较多复用思路；编译为小程序时需适配路由、请求、存储等。
- **uni-app**：Vue 为主，若团队更熟 Vue 可考虑；生态多端组件多。

### 大致步骤

1. 新建 Taro/uni-app 项目，配置编译为 H5 与微信小程序。
2. 将合拍吗的**页面与流程**（首页选模式、答题、结果页、支付）在 Taro/uni-app 里重写或迁移；**API 调用**指向现有 Next.js 后端（如 `POST /api/v1/orders`、报告页等）。
3. 小程序端登录：用 `wx.login` 取 code，后端用 code 换 **小程序 openid/session_key**（需小程序 AppID + AppSecret），与现有 User 表打通（可新加 `miniprogramOpenId` 或与 wechatOpenId 区分）。
4. 小程序支付：后端根据「小程序」下单并返回小程序支付所需参数，前端调 `wx.requestPayment`。
5. 部署：H5 部署到现有域名；小程序在开发者工具上传、提交审核。

**优点**：一套代码多端、小程序内体验接近原生。  
**缺点**：需重写/迁移前端，工作量大，且要维护两套部署（Next 只做 API 或逐步迁到 Taro 的 Node 服务）。

---

## 方案三：小程序原生重写

用微信小程序原生（或 WXML + WXS）从零写一套小程序，所有接口仍调你现有 **Next.js 后端 API**，不部署 Next 前端到小程序。

- 适合：对小程序体验、性能、审核有极高要求，且有人力做两套前端。
- 与方案二类似，但不用 Taro/uni-app，直接用小程序语法。

---

## 推荐路线

1. **短期**：用 **方案一（web-view）** 先上架小程序，配置好业务域名与公众号/小程序关联，验证分享与转化。
2. **中期**：若数据好、需要更好体验或小程序内支付/登录闭环，再评估 **方案二（Taro）**，把核心流程迁到 Taro，复用现有 API 与数据库。
3. 现有 **微信支付、OAuth、订单与结果页** 逻辑都可继续用；扩展小程序时主要增加：**小程序 openid 登录** 与 **小程序支付** 两条接口/配置。

---

## 相关文档

- [PAYMENT.md](../PAYMENT.md)：当前微信支付（Native/H5/JSAPI）与回调配置。
- [DEPLOY.md](../DEPLOY.md)：Next 应用部署与 `APP_URL` 等环境变量。
- 小程序 web-view：[官方文档](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)。
- 小程序业务域名：[配置说明](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/webview.html)。
