# 解锁深度报告页「优惠码」功能评估

## 一、是否适合加优惠码入口

**结论：适合。**

| 维度 | 说明 |
|------|------|
| **场景匹配** | 用户已到结果页、看到深度报告价值，此时提供「有优惠码？输入可减免」入口，符合「临门一脚」的转化场景，常用于活动、KOL、渠道投放。 |
| **与现有流程不冲突** | 当前流程是：点击「¥9.90 立即解锁」→ 弹窗选支付方式 → 调 `/api/v1/orders` 创建订单 → 支付。在创建订单前增加「可选：输入优惠码」步骤即可，不改变主流程。 |
| **UI 位置建议** | 两处二选一或都做：<br>1. **结果页解锁卡片**：在「¥9.90 立即解锁」按钮上方加一行「有优惠码？」，点击展开输入框，校验通过后按钮文案可变为「¥0 立即解锁」或显示折后价。<br>2. **支付弹窗内**：在展示支付金额/二维码的区域上方加「使用优惠码」，适合用户先点支付再想起来有码的情况。 |
| **注意** | 与现有「兑换码」区分开：现有 `RedeemCode` 用于**测评资格**（在小红书等买码→在 StageSelector 输入→按 stage 解锁做题），和「深度报告付费减免」是两套业务，建议新产品叫「优惠码」且用独立数据与接口。 |

---

## 二、与现有「兑换码」的区别

| 对比项 | 现有兑换码 (RedeemCode) | 拟新增优惠码 (PromoCode) |
|--------|--------------------------|---------------------------|
| **用途** | 解锁「做测评」资格（按阶段） | 解锁「深度报告」时减价或免单 |
| **使用时机** | 开始测评前（StageSelector / 答题入口） | 结果页解锁深度报告时（支付前/下单前） |
| **效果** | 允许某设备/用户做某阶段题目 | 订单金额减免或 0 元解锁 |
| **数据** | `RedeemCode` + `RedeemCodeUsage`（按 stage） | 需新建表，见下节 |

---

## 三、后台「生成优惠码」需要的能力

### 1. 数据模型建议

在现有 Prisma 中新增**优惠码**表（与 `RedeemCode` 分离），例如：

```prisma
// 优惠码：用于「解锁深度报告」时的折扣/免单
model PromoCode {
  id          String   @id @default(cuid())
  code        String   @unique   // 如 HPDISCOUNT-XXXX 或自定义
  type        PromoType           // FIXED_OFF | PERCENT_OFF | FREE_UNLOCK
  value       Int                 // 固定减免分 / 折扣百分比(1-99) / 0 表示免单
  maxUses     Int?                // 总使用次数上限，null 表示不限制
  usedCount   Int      @default(0)
  expiresAt   DateTime?
  disabled    Boolean  @default(false)
  batchId     String?             // 批次，便于后台筛选
  createdAt   DateTime @default(now())

  usages      PromoCodeUsage[]
}

model PromoCodeUsage {
  id           String   @id @default(cuid())
  promoCodeId  String
  promoCode    PromoCode @relation(...)
  resultId     String    // 用在该结果上
  orderId     String?   // 若走支付 0 元，可能无订单
  usedAt      DateTime  @default(now())
}

enum PromoType { FIXED_OFF, PERCENT_OFF, FREE_UNLOCK }
```

- **FIXED_OFF**：固定减免，`value` 为金额（分），如 500 表示减 5 元。  
- **PERCENT_OFF**：折扣，`value` 为 1–99，如 50 表示 5 折。  
- **FREE_UNLOCK**：免单，`value` 可固定为 0，下单时金额直接为 0，无需调支付。

### 2. 后台功能

- **生成**：支持按「类型 + 面额/折扣 + 数量 + 有效期 + 可选批次」批量生成码（格式可读即可，如 `HP9-XXXX-XXXX`）。  
- **列表/筛选**：按批次、状态（未用/已用/过期/禁用）、时间范围查看。  
- **单码管理**：启用/禁用、查看使用记录（resultId、订单、时间）。  
- **导出**：导出为 CSV/文本，便于发给 KOL 或活动。

可放在现有 **Admin 兑换码** 同一模块下增加 Tab「优惠码」，或单独菜单「优惠码管理」，与「兑换码」并列。

### 3. API 设计要点

- **校验接口**（前端输入后调用）：  
  `POST /api/v1/promo/verify`  
  入参：`code`、`resultId`（或 `sessionId` 换 resultId）。  
  返回：是否有效、类型、折后金额（分）或「免单」、提示文案（如「已减 5 元」）。  

- **创建订单**：  
  当前 `POST /api/v1/orders` 入参增加可选 `promoCode`。  
  若传了且校验通过：  
  - 免单：直接调「免费解锁」逻辑（与现有 `POST /api/v1/result/[sessionId]/unlock` 一致），并记一条 `PromoCodeUsage`，不创建订单。  
  - 减免：`amount = max(0, TIER_AMOUNT_CENTS - 减免)`，若为 0 同样走免费解锁 + 记使用；若 >0 则创建订单，支付成功后再记 `PromoCodeUsage`。

这样后台「生成优惠码」只需往 `PromoCode` 表写入，并保证校验与下单逻辑使用同一套规则即可。

---

## 四、实现顺序建议

1. **数据与 API**：新增 `PromoCode`（及 `PromoCodeUsage`）、`promo/verify`、修改 `orders` 创建逻辑支持 `promoCode` 与免单/减免。  
2. **后台**：优惠码列表、生成（含批次/有效期）、启用禁用、导出。  
3. **前端**：结果页「解锁深度报告」区块 + 支付弹窗内「使用优惠码」入口，调用 verify 后更新展示金额或免单按钮。

---

## 五、小结

- **适不适合加**：适合，在「解锁深度报告」页（及支付弹窗）加「优惠码」入口能提升活动/渠道转化，且不干扰现有兑换码逻辑。  
- **后台生成**：需要新建「优惠码」数据与后台生成/管理能力；与现有「兑换码」分离，避免概念混用。按上述模型与 API 设计即可支持「生成优惠码」并在前端完成校验与下单。
