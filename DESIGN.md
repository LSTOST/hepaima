# DESIGN.md — 知我实验室·依恋报告

## 1. Visual Theme & Atmosphere

**One-line:** 克制的温柔，带有学术感的亲密。

不是心理咨询机构的冷静专业，也不是小红书的粉嫩可爱。
调性参考：一本设计好的心理学科普书的封面——懂你，但不滥情。

- 留白多，信息密度低，每屏只做一件事
- 排版有书卷气：衬线标题 + 无衬线正文，形成层次对比
- 色彩克制：主紫色只用于按钮和关键词高亮，背景永远是暖白
- 无卡通插画，无 emoji 作为主视觉，无渐变背景

---

## 2. Color Palette & Roles

### 核心色板

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#7C5CBF` | 品牌识别色，按钮、标签、关键词高亮 |
| `--color-primary-light` | `#9B7FD4` | 悬停态 |
| `--color-primary-dark` | `#5E3FA3` | 按下态 |
| `--color-primary-surface` | `#F0EBFA` | 卡片浅紫底，极少使用 |
| `--color-ink` | `#1A1A2E` | 主文字，近黑带蓝调，**禁用纯黑 #000** |
| `--color-ink-secondary` | `#4A4A6A` | 次要文字、副标题 |
| `--color-ink-tertiary` | `#8A8AAA` | 辅助文字、进度、注释 |
| `--color-border` | `#E8E4F0` | 分割线、输入框边框 |
| `--color-surface` | `#FAFAF8` | 页面背景（暖白，**禁用纯白 #FFF**）|
| `--color-surface-raised` | `#FFFFFF` | 卡片、浮层背景 |
| `--color-success` | `#4CAF87` | 成功态 |
| `--color-warning` | `#E8A838` | 警告态 |
| `--color-error` | `#D4544A` | 错误态（唯一允许红色出现的场景）|

### 依恋类型专属色（用于报告封面、类型标签、坐标轴高亮点）

| 类型 | Token | Hex | 语义 |
|---|---|---|---|
| 安全型 | `--color-type-secure` | `#4CAF87` | 绿，稳定 |
| 焦虑型 | `--color-type-anxious` | `#E8A838` | 琥珀，热切 |
| 回避型 | `--color-type-avoidant` | `#5B8FC9` | 蓝，疏离 |
| 恐惧型 | `--color-type-fearful` | `#9B6B9E` | 深紫，复杂 |

---

## 3. Typography Rules

### 字体栈

```css
/* 标题：衬线，书卷气 */
font-family: 'Noto Serif SC', 'Source Han Serif SC', serif;

/* 正文：无衬线，易读 */
font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 字号层级（H5 页面）

| Token | rem | px | 用途 |
|---|---|---|---|
| `--text-xs` | 0.75rem | 12px | 版权、极小注释 |
| `--text-sm` | 0.875rem | 14px | 辅助说明、进度标注 |
| `--text-base` | 1rem | 16px | 正文 |
| `--text-lg` | 1.125rem | 18px | 强调段落、小标题 |
| `--text-xl` | 1.25rem | 20px | 题目文字 |
| `--text-2xl` | 1.5rem | 24px | 区块标题 |
| `--text-3xl` | 1.875rem | 30px | 页面主标题 |

### 行高

```css
--leading-tight:  1.4;   /* 标题 */
--leading-normal: 1.7;   /* 正文（中文需宽松）*/
--leading-loose:  2.0;   /* 需要呼吸感的段落 */
```

### 字重规则

- 标题：600（Semi-bold）
- 正文：400（Regular）
- 注释：300（Light）
- **禁止使用 700（Bold）在正文段落里强调**，用 `--color-primary` 颜色替代

---

## 4. Component Stylings

### 主按钮（提交、下一题）

```css
background: var(--color-primary);
color: #FFFFFF;
border-radius: 12px;
padding: 14px 24px;
font-size: var(--text-base);
font-weight: 600;
width: 100%;
min-height: 52px;
border: none;
box-shadow: none; /* flat design，禁止阴影 */

&:active {
  background: var(--color-primary-dark);
  transform: scale(0.98);
}
```

### 次级按钮（上一题、跳过）

```css
background: transparent;
color: var(--color-ink-secondary);
border: 1px solid var(--color-border);
border-radius: 12px;
/* 其他同主按钮 */
```

### Likert 7 级量表选项

横向排列 7 个圆形可点击区域：

```
完全不符合  ①  ②  ③  ④  ⑤  ⑥  ⑦  完全符合
```

```css
/* 圆圈 */
width: 36px;
height: 36px;
border-radius: 50%;
border: 1.5px solid var(--color-border);
background: var(--color-surface-raised);

/* 选中态 */
background: var(--color-primary);
border-color: var(--color-primary);
color: #FFFFFF;

/* 布局：均等分布，不固定间距 */
display: flex;
justify-content: space-between;
```

选中后**自动进入下一题**，不显示"下一题"按钮。

### 进度条

```css
/* 轨道 */
height: 4px;
background: var(--color-border);
border-radius: 2px;

/* 已完成 */
background: var(--color-primary);
border-radius: 2px;

/* 文字标注：右对齐，--text-sm，--color-ink-tertiary */
```

### 卡片

```css
background: var(--color-surface-raised);
border-radius: 16px;
padding: 24px;
box-shadow: 0 2px 12px rgba(124, 92, 191, 0.06);
border: 1px solid var(--color-border);
```

### 输入框

```css
border: 1px solid var(--color-border);
border-radius: 10px;
padding: 12px 16px;
font-size: var(--text-base);
color: var(--color-ink);
background: var(--color-surface-raised);

&:focus {
  outline: none;
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.08);
}
```

**禁止：彩色边框输入框**

---

## 5. Layout Principles

### 间距系统（8px 基础网格）

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;
--space-16: 64px;
```

### H5 内容区

```css
max-width: 390px;   /* iPhone 主流尺寸 */
margin: 0 auto;
padding: 0 20px;
```

### 页面流结构

```
欢迎页 → 题目页（12页，每页1题）→ 提交中 → 完成页
```

每屏只做一件事，**禁止在同一屏展示多个题目**。

---

## 6. Depth & Elevation

本项目极度克制地使用阴影：

| 层级 | 使用场景 | Shadow |
|---|---|---|
| 0（flat）| 按钮、标签 | none |
| 1（subtle）| 卡片 | `0 2px 12px rgba(124,92,191,0.06)` |
| 2（overlay）| 不使用 | — |

**禁止：多重投影叠加、卡片内嵌套卡片。**

---

## 7. Do's and Don'ts

### ✅ Do

- 大量留白，每屏单一任务
- 衬线字体用于标题，制造书卷感
- 按钮全宽，min-height 52px，移动端易点击
- 类型色只用于对应类型的标签和高亮点
- 加载状态用一句话文案代替 spinner（如"正在生成你的依恋报告…"）
- 错误提示用内联方式，不用弹窗 modal

### ❌ Don't

- 渐变色背景（尤其是紫色渐变，丧失品牌辨识度）
- 卡通插画或 emoji 作为主视觉
- 超过 3 种字体
- 红色用于非错误状态
- 按钮带阴影（flat design 原则）
- 旋转圆圈 spinner 作为加载状态
- 弹窗 modal 用于提示信息
- 圆形按钮

---

## 8. Page-Specific Specs

### 欢迎页

- Logo 顶部居中（小尺寸）
- 主标题：「了解你的依恋类型」，Noto Serif SC，`--text-3xl`，`--color-ink`
- 副标题：「12道题，5分钟，看见你在感情里的真实模式」，`--text-base`，`--color-ink-secondary`
- 隐私说明：`--text-sm`，`--color-ink-tertiary`
- 主按钮：「开始测试」

### 题目页

- 顶部：进度条 + 右对齐题号（`问题 X / 12`）
- 题目文字：Noto Serif SC，`--text-xl`，`--leading-tight`，居中
- 7 级量表（见组件规范）
- 量表两端标签：`--text-xs`，`--color-ink-tertiary`
- 选中后自动跳转，底部仅"上一题"文字链接

### 提交中页

- 一句话文案，无 spinner
- 示例：「正在生成你的依恋报告，通常需要30秒左右」
- 品牌语：「了解自己，是一切关系的起点」，`--text-sm`，`--color-ink-tertiary`

### 完成页

- 标题：「报告已发送」，Noto Serif SC，`--text-2xl`
- 说明：「报告链接已通过微信发送，请查收」
- 小字：「如果5分钟内未收到，请检查服务号消息」，`--text-sm`，`--color-ink-tertiary`
- **不放任何引流链接**

---

## 9. PDF Report Specs

### 页面设置

```
纸张：A4（210mm × 297mm）
边距：上下 20mm，左右 18mm
内容宽度：174mm
字体必须内嵌，不依赖系统字体
```

### 字体层级（PDF）

| 层级 | 字体 | 字号 | 颜色 |
|---|---|---|---|
| 章节标题 H1 | Noto Serif SC Bold | 18pt | `--color-ink` |
| 小节标题 H2 | Noto Sans SC Bold | 14pt | `--color-primary` |
| 模式标题 H3 | Noto Sans SC Bold | 12pt | `--color-ink` |
| 正文 | Noto Sans SC Regular | 11pt / 行高1.8 | `--color-ink` |
| 注释 | Noto Sans SC Light | 9pt | `--color-ink-tertiary` |

### 封面

从上到下：知我实验室 Logo → 大留白（约40mm）→ 类型色圆形色块（直径60mm）→ 类型名称（28pt，类型主题色，Noto Serif SC）→「依恋类型深度解读报告」（16pt，次要文字）→ 用户昵称+生成日期（底部）

### 坐标轴图（第2页）

- 横轴：回避维度（左低右高）
- 纵轴：焦虑维度（下低上高）
- 四象限用类型色填充（透明度10%）
- 用户位置：实心圆点，直径8px，类型主题色
- 刻度：1-7

### 水印（每页底部居中）

```
知我实验室出品 · {生成日期} · 仅供{昵称}个人参考
字号：8pt，颜色：--color-ink-tertiary
```

---

## 10. Agent Prompt Guide

### 快速色彩参考

```
主色: #7C5CBF  |  主文字: #1A1A2E  |  次要文字: #4A4A6A
背景: #FAFAF8  |  卡片: #FFFFFF   |  边框: #E8E4F0
安全型: #4CAF87 | 焦虑型: #E8A838 | 回避型: #5B8FC9 | 恐惧型: #9B6B9E
```

### 给 Cursor / AI Agent 的提示词模板

```
使用 DESIGN.md 里的设计系统构建本页面。
- 背景用 --color-surface（#FAFAF8），不用纯白
- 标题用 Noto Serif SC，正文用 Noto Sans SC
- 主按钮全宽，高度 52px，圆角 12px，背景 #7C5CBF，无阴影
- 不使用渐变背景，不使用卡通插画
- 移动端优先，内容区最大宽度 390px，左右 padding 20px
- 加载状态用文案，不用 spinner
```
