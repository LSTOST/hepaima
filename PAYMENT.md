# 合拍吗 - 微信支付 & 支付宝接入指南

基于 **Next.js 15 + 阿里云 + hepaima.kyx123.com（已备案）+ 个体户商户号** 的完整接入说明。

---

## 一、前置条件核对

| 项目 | 说明 | 你的情况 |
|------|------|----------|
| 域名备案 | 支付回调需公网可访问域名，且已备案 | ✅ hepaima.kyx123.com 已备案 |
| 微信支付 | 微信商户号（个体户已具备） | ✅ 个体户商户号 |
| 支付宝 | 支付宝商户号（个体户可申请） | 需确认已开通 |
| 服务器 | 支持 HTTPS、可接收 POST 回调 | ✅ 阿里云 + Nginx |

**域名要求**：微信/支付宝回调地址必须使用 **已备案域名**，且建议 **HTTPS**。你当前 `hepaima.kyx123.com` 满足要求。

---

## 二、接入方式选择（Web 场景）

- **PC 浏览器**：用户扫码付款 → 用 **微信 Native 支付**（二维码）/ **支付宝 电脑网站支付**。
- **手机浏览器**：跳转微信/支付宝 APP 或 H5 收银台 → 用 **微信 H5 支付** / **支付宝 手机网站支付**。

建议：同一笔订单根据 User-Agent 选择「PC 用 Native/电脑网站」「手机用 H5/手机网站」，或先做一种（如先做 PC 扫码），再扩展。

---

## 三、微信支付接入

### 3.1 商户平台配置

1. 登录 [微信支付商户平台](https://pay.weixin.qq.com/)
2. **产品中心** → 开通 **Native 支付**（PC 扫码）、**H5 支付**（手机浏览器，需配置支付目录/域名）
3. **账户中心** → **API 安全** → 设置 **API v3 密钥**（32 位），并下载 **API 证书**（apiclient_key.pem、apiclient_cert.pem、apiclient_cert.p12 可选）
4. 记下：**商户号**（mchid）、**AppID**（若用公众号/小程序可再配，Native/H5 主要用商户号+证书）

**H5 支付**：在「产品中心 → H5 支付」里设置 **支付授权目录**，例如：  
`https://hepaima.kyx123.com/` 或 `https://hepaima.kyx123.com/pay/`（以你实际发起支付的页面为准，且需备案域名）。

### 3.2 安装依赖

```bash
pnpm add wechatpay-node-v3
```

（或使用官方 [wechatpay-node-v3](https://github.com/nicejs-is-cool/wechatpay-node-v3) 等 v3 版 Node SDK，能验签、调统一下单即可。）

### 3.3 环境变量

在 `.env` 中增加（**勿提交到 Git**）：

```env
# 微信支付
WECHAT_PAY_MCH_ID=你的商户号
WECHAT_PAY_APP_ID=你的AppID
WECHAT_PAY_API_V3_KEY=你的32位APIv3密钥
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/wechat/apiclient_key.pem
WECHAT_PAY_CERT_SERIAL_NO=证书序列号
```

证书序列号可在商户平台「API 安全」中查看，或通过 openssl 读取证书得到。

### 3.4 微信 Native 下单（PC 扫码）

后端用 **Native 支付** 生成 code_url，前端用二维码组件展示让用户扫码。

**接口说明**：  
- 统一下单 API：`POST https://api.mch.weixin.qq.com/v3/pay/transactions/native`  
- 请求体需包含：appid、mch_id、description、out_trade_no（你的订单号）、notify_url、amount（总金额，单位分）等。  
- 返回里会有 `code_url`，用于生成二维码。

**notify_url**：需公网 HTTPS，例如：  
`https://hepaima.kyx123.com/api/v1/payment/wechat/notify`

### 3.5 微信 H5 下单（手机浏览器）

**接口**：`POST https://api.mch.weixin.qq.com/v3/pay/transactions/h5`  
- 需传 `scene_info`（h5_info）中的 `type`、`app_name`、`app_url` 等。  
- 返回里是 `h5_url`，前端在手机浏览器中跳转该 URL 即可调起支付。

### 3.6 异步通知（回调）与验签

- 微信会向你的 `notify_url` 发送 **POST**，Body 为 JSON，并带请求头：  
  `Wechatpay-Signature`、`Wechatpay-Nonce`、`Wechatpay-Timestamp`、`Wechatpay-Serial`。  
- 必须用 **API v3 密钥** 和 **平台证书** 做 **验签**，验签通过后再根据 `out_trade_no`、`trade_state === 'SUCCESS'` 更新订单状态并返回 `{ "code": "SUCCESS", "message": "成功" }`。  
- 未验签或返回非 2xx/未返回正确 JSON，微信会重试，需做好幂等（根据 out_trade_no 只处理一次）。

你现有 Prisma 中已有 `Order`（含 `paymentId`、`status`、`paidAt`），在回调里将对应订单置为 `PAID`、写入 `paymentId`、`paidAt`，并更新 `Result.purchasedTier` 即可。

---

## 四、支付宝接入

### 4.1 开放平台配置

1. 登录 [支付宝开放平台](https://open.alipay.com/)
2. 使用 **已签约** 的 **电脑网站支付** / **手机网站支付** 应用（个体户商户号对应应用）
3. **开发信息** → **接口加签方式**：选择 **公钥** 模式，生成应用私钥，上传应用公钥，获取 **支付宝公钥**
4. 记下：**AppID**、**应用私钥**、**支付宝公钥**

### 4.2 安装依赖

```bash
pnpm add alipay-sdk
```

（或使用官方推荐的 [alipay-sdk](https://github.com/alipay/alipay-sdk-nodejs-all)）

### 4.3 环境变量

```env
# 支付宝
ALIPAY_APP_ID=你的应用AppID
ALIPAY_PRIVATE_KEY=应用私钥字符串（可去换行合并为一行）
ALIPAY_ALIPAY_PUBLIC_KEY=支付宝公钥
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

生产环境网关一般为 `https://openapi.alipay.com/gateway.do`，沙箱用 `https://openapi-sandbox.dl.alipaydev.com/gateway.do`。

### 4.4 电脑网站支付（PC）

- 接口：`alipay.trade.page.pay`
- 传入：out_trade_no、total_amount（元，字符串）、subject、return_url（同步跳转）、notify_url（异步通知）。  
- 后端生成 **form 表单 HTML** 或 **支付 URL**，前端跳转或自动提交到支付宝收银台。

### 4.5 手机网站支付（WAP）

- 接口：`alipay.trade.wap.pay`
- 参数类似，return_url / notify_url 必填。  
- 同样返回表单或 URL，在手机浏览器中跳转。

### 4.6 异步通知（notify_url）与验签

- 支付宝对 `notify_url` 发起 **POST**，Body 为 **form 表单**（application/x-www-form-urlencoded），包含 `out_trade_no`、`trade_status`（`TRADE_SUCCESS`/`TRADE_FINISH` 表示成功）等。  
- 必须先使用 **支付宝公钥** 验证 `sign`，再根据 `out_trade_no` 更新订单，并返回纯文本 `success`（否则支付宝会重试）。  
- 同样要做幂等：同一 `out_trade_no` 只处理一次。

---

## 五、与现有业务对接（订单 + 报告解锁）

你当前已有：

- **Order**：`resultId`、`deviceId`、`tier`、`amount`、`status`、`paymentMethod`、`paymentId`、`paidAt`
- **Result**：`purchasedTier`（FREE/STANDARD/PREMIUM）
- 解锁逻辑在 `POST /api/v1/result/[sessionId]/unlock`（目前为免费解锁）

建议流程：

1. **创建订单**  
   - 接口：`POST /api/v1/orders`（或 `/api/v1/payment/order`）  
   - 入参：`resultId`、`sessionId`、`tier`（STANDARD/PREMIUM）、`paymentMethod`（WECHAT/ALIPAY）、可选 `deviceId`。  
   - 用 Prisma 创建 `Order`（status=PENDING），生成唯一 `out_trade_no`（可直接用 `order.id` 或 `order.id + 时间戳`）。  
   - 根据 `paymentMethod` 和 UA 调用微信 Native/H5 或支付宝 page/wap，得到 **支付参数**（微信 code_url/h5_url，支付宝 form 或 url）。

2. **前端**  
   - 微信 Native：用 `code_url` 生成二维码，用户扫码支付。  
   - 微信 H5：跳转 `h5_url`。  
   - 支付宝：跳转或提交表单到支付宝。

3. **异步回调**  
   - 微信：`POST /api/v1/payment/wechat/notify` → 验签 → 更新 Order（PAID、paymentId、paidAt）→ 根据 `resultId` 更新 `Result.purchasedTier`。  
   - 支付宝：`POST /api/v1/payment/alipay/notify` → 验签 → 同上。

4. **前端轮询或跳转**  
   - 支付成功后，用户可能通过 return_url 回到你站内，或仍在结果页。  
   - 可在结果页轮询 `GET /api/v1/result/[sessionId]`（或订单状态接口），当 `order.status === 'PAID'` 或 `result.purchasedTier` 已升级时，展示已解锁报告或跳转报告页。

5. **原免费解锁**  
   - 若暂时保留「免费解锁」入口，可继续保留 `POST /api/v1/result/[sessionId]/unlock`；正式上线付费后，可改为仅支付成功才更新 `purchasedTier`，或根据业务决定是否保留免费通道。

---

## 六、API 与目录结构建议

```
src/
  app/api/v1/
    orders/
      route.ts              # POST 创建订单 + 调起微信/支付宝，返回支付参数
    payment/
      wechat/
        notify/
          route.ts          # 微信支付异步通知
      alipay/
        notify/
          route.ts          # 支付宝异步通知
  lib/
    payment/
      wechat.ts             # 微信下单、验签
      alipay.ts             # 支付宝下单、验签
```

- **创建订单**：先写库 Order，再调微信/支付宝接口，把 `code_url` / `h5_url` / 支付宝 form 或 url 返回给前端。  
- **回调**：只做验签、查单、更新 Order 和 Result，并返回微信/支付宝要求的响应格式。

---

## 七、安全与幂等

- **验签**：微信、支付宝回调都必须先验签再处理业务，防止伪造。  
- **幂等**：用 `out_trade_no`（即你订单 id）做唯一键，同一订单只置为 PAID 一次，避免重复解锁。  
- **金额校验**：回调里用回调中的金额与订单表中的 `amount` 做一次校验，防止篡改。  
- **密钥与证书**：私钥、API 密钥仅放在服务端环境变量或受控目录，不要进 Git；证书建议放在服务器固定目录，通过 `WECHAT_PAY_PRIVATE_KEY_PATH` 等引用。

---

## 八、阿里云部署注意

- **Nginx**：确保 `https://hepaima.kyx123.com/api/...` 已正确反代到 Next.js（如 `proxy_pass http://127.0.0.1:3000`），以便支付回调能到达应用。  
- **防火墙/安全组**：无需单独放行，回调由微信/支付宝服务器主动访问你的公网域名。  
- **HTTPS**：建议全站 HTTPS（宝塔可申请 Let’s Encrypt），支付回调必须使用 HTTPS。  
- **环境变量**：在 PM2 或宝塔 Node 项目中配置上述 `WECHAT_*`、`ALIPAY_*`，并重启进程。

---

## 九、测试建议

- **微信**：商户平台可开 **沙箱环境**（若提供），用沙箱密钥和沙箱 URL 测试 Native/H5 与回调。  
- **支付宝**：使用 **开放平台沙箱**，配置沙箱 AppID、沙箱网关、沙箱应用私钥与支付宝公钥，先走通下单与 notify 再切生产。  
- 本地调试回调可用 **内网穿透**（如 ngrok、frp）将 `https://xxx.ngrok.io/api/v1/payment/wechat/notify` 临时作为 notify_url，注意不要在生产使用。

---

## 十、小结清单

| 步骤 | 微信支付 | 支付宝 |
|------|----------|--------|
| 商户/应用 | 商户号 + APIv3 密钥 + 证书 | AppID + 应用私钥 + 支付宝公钥 |
| 开通产品 | Native、H5（并配支付目录） | 电脑网站支付、手机网站支付 |
| 后端 | wechatpay-node-v3，统一下单 + 回调验签 | alipay-sdk，page/wap 下单 + 回调验签 |
| 回调 URL | https://hepaima.kyx123.com/api/v1/payment/wechat/notify | https://hepaima.kyx123.com/api/v1/payment/alipay/notify |
| 与现有系统 | Order 表 + Result.purchasedTier，回调中更新 | 同上 |

按上述步骤配置环境变量、实现创建订单与两个 notify 接口、对接现有 Order/Result 与结果页，即可完成微信支付和支付宝的完整接入。

---

## 十一、环境变量与商户信息填写说明（项目已接入代码）

项目内已实现：`POST /api/v1/orders` 创建订单、`/api/v1/payment/wechat/notify` 与 `/api/v1/payment/alipay/notify` 回调。按下面填写环境变量和商户信息即可联调。

### 11.1 公共

在项目根目录 `.env`（或服务器上的环境变量）中增加：

```env
# 支付回调使用的站点地址，必须 HTTPS、已备案域名
NEXT_PUBLIC_APP_URL=https://hepaima.kyx123.com
```

### 11.2 微信支付

| 变量名 | 说明 | 如何获取 |
|--------|------|----------|
| `WECHAT_PAY_MCH_ID` | 商户号 | 微信支付商户平台 → 账户中心 → 商户信息 |
| `WECHAT_PAY_APP_ID` | 公众号/移动应用 AppID | 若用 Native/H5，可用「商户平台关联的公众号」或「开放平台移动应用」的 AppID |
| `WECHAT_PAY_API_V3_KEY` | API v3 密钥（32 位） | 商户平台 → 账户中心 → API 安全 → 设置 APIv3 密钥 |
| 证书文件 | 商户 API 证书 | 商户平台 → 账户中心 → API 安全 → 申请 API 证书，下载后解压得到 `apiclient_cert.pem`、`apiclient_key.pem` |

**证书放置方式二选一：**

- **方式 A**：在项目根目录下建目录 `certs/wechat/`，将 `apiclient_cert.pem`、`apiclient_key.pem` 放进去（不要把 `certs/` 提交到 Git，已在 `.gitignore` 时忽略）。
- **方式 B**：自定义目录，在 `.env` 里设置  
  `WECHAT_PAY_CERT_DIR=/服务器上的绝对路径/wechat`  
  再把上述两个 pem 文件放到该目录。

**.env 示例（微信部分）：**

```env
WECHAT_PAY_MCH_ID=1234567890
WECHAT_PAY_APP_ID=wx1234567890abcdef
WECHAT_PAY_API_V3_KEY=你的32位APIv3密钥
# 可选，不填则默认用项目根目录下 certs/wechat/
# WECHAT_PAY_CERT_DIR=/www/certs/wechat
```

**商户平台必做：**

1. 产品中心开通 **Native 支付**、**H5 支付**。
2. H5 支付里配置 **支付授权目录**，例如：`https://hepaima.kyx123.com/`（与你在 H5 里发起支付的页面一致，且为已备案域名）。

### 11.3 支付宝

| 变量名 | 说明 | 如何获取 |
|--------|------|----------|
| `ALIPAY_APP_ID` | 应用 AppID | 开放平台 → 开发者中心 → 应用详情 |
| `ALIPAY_PRIVATE_KEY` | 应用私钥（PEM 内容） | 用 [支付宝密钥工具](https://opendocs.alipay.com/common/02kipk) 生成，复制私钥内容；若多行，可合并为一行并把换行写成 `\n` |
| `ALIPAY_ALIPAY_PUBLIC_KEY` | 支付宝公钥 | 开放平台 → 应用 → 接口加签方式 → 查看支付宝公钥，复制整段 |
| `ALIPAY_GATEWAY` | 网关（可选） | 正式：`https://openapi.alipay.com/gateway.do`；沙箱：`https://openapi-sandbox.dl.alipaydev.com/gateway.do` |

**.env 示例（支付宝部分）：**

```env
ALIPAY_APP_ID=2021001234567890
ALIPAY_PRIVATE_KEY=MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
ALIPAY_ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
# 沙箱时改为沙箱网关
# ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
```

**私钥/公钥格式：**  
- 多行 PEM 可保留换行，在 `.env` 里用双引号包起来，或把 `\n` 写成字面量两字符。  
- 若使用 PKCS8 格式私钥，需在代码里为 `AlipaySdk` 指定 `keyType: 'PKCS8'`（当前默认 PKCS1）。

**开放平台必做：**

1. 为应用签约 **电脑网站支付**、**手机网站支付**。
2. 接口加签方式里上传 **应用公钥**，并保存 **支付宝公钥** 用于上面的 `ALIPAY_ALIPAY_PUBLIC_KEY`。

### 11.4 安装依赖

在项目根目录执行：

```bash
pnpm install
```

会安装 `wechatpay-node-v3`、`alipay-sdk`。安装完成后执行 `pnpm build` 确认无报错。

### 11.5 回调 URL 汇总（配置到微信/支付宝后台）

- **微信支付通知 URL**：`https://hepaima.kyx123.com/api/v1/payment/wechat/notify`  
- **支付宝异步通知 URL**：在创建订单时已由代码写入为 `https://hepaima.kyx123.com/api/v1/payment/alipay/notify`，无需在开放平台再配「默认通知地址」也可（若平台有填，以接口传入为准）。

### 11.6 价格档位（可改）

当前档位金额在 `src/lib/payment/constants.ts` 中：

- `STANDARD`：1290 分（12.9 元）
- `PREMIUM`：2990 分（29.9 元）

如需与 PRD 中「通用版/阶段版」不同价格，直接改 `TIER_AMOUNT_CENTS` 即可。
