# 第一篇推文配图 Prompt

## 使用说明

- 推荐工具：Midjourney / DALL-E / Stable Diffusion
- 所有图片保持统一风格，形成系列感
- 封面图尺寸：900×383px（公众号首图比例 2.35:1）
- 文内插图尺寸：方形 1080×1080px 或竖版 1080×1350px
- 导出后可用 Figma/Canva 叠加中文文字

---

## 封面图（首图）

### Prompt

```
Minimalist editorial illustration, two abstract human silhouettes facing each other, connected by a gentle glowing thread from heart to heart. Soft gradient background from warm pink (#EC4899) to violet (#8B5CF6). Clean flat design, no facial features, smooth rounded shapes. The silhouettes have a slight translucency. Subtle geometric patterns in the background. Modern, warm, psychological feel. No text. --ar 2.35:1 --style raw --s 200
```

### 备选 Prompt（更抽象）

```
Abstract minimalist illustration of two overlapping circles, one warm pink and one soft violet, with a glowing intersection area in the center. Inside the intersection, a small heart-shaped light. Clean white background with very subtle noise texture. Flat design, editorial style, modern and calming. No text. --ar 2.35:1 --style raw --s 200
```

> 封面图生成后，用 Canva/Figma 叠加标题文字：
> - 主标题：「你谈恋爱的方式，在你3岁前就决定了」
> - 字体：思源黑体 Bold / 阿里巴巴普惠体 Bold
> - 颜色：白色，带轻微投影

---

## 安全型 🛡️ 插图

### 关键词：稳定、信任、温暖、平衡

```
Minimalist flat illustration, a single abstract human figure standing calmly with arms gently open in a welcoming pose. A soft warm golden shield-like glow surrounds the figure. Background is a clean warm cream (#FFF8F0) with a subtle circular halo. The figure is rendered in soft terracotta and warm beige tones. Feeling of stability, warmth, and groundedness. Simple geometric shapes, no facial features, rounded smooth forms. Modern editorial style. No text. --ar 1:1 --style raw --s 200
```

### 叠加文字建议

```
🛡️ 安全型
「爱你，也相信你爱我」
```

- 文字颜色：深棕 #78350F 或暖灰 #44403C
- 放置位置：图片底部或左下角

---

## 焦虑型 🔥 插图

### 关键词：紧张、渴望、靠近、不安

```
Minimalist flat illustration, a single abstract human figure leaning forward with both hands reaching outward, as if trying to hold onto something invisible. Surrounding the figure are scattered small glowing dots drifting away, symbolizing uncertainty. Background is soft coral pink (#FFF1F2) with subtle ripple patterns. The figure is rendered in warm rose and salmon tones. Feeling of longing and emotional intensity. Simple geometric shapes, no facial features, rounded smooth forms. Modern editorial style. No text. --ar 1:1 --style raw --s 200
```

### 叠加文字建议

```
🔥 焦虑型
「你是不是不爱我了？」
```

- 文字颜色：玫红 #BE123C 或深粉 #9F1239
- 放置位置：图片底部或左下角

---

## 回避型 🧊 插图

### 关键词：独立、距离、防御、空间

```
Minimalist flat illustration, a single abstract human figure standing with arms crossed or slightly turned away, surrounded by a translucent geometric bubble or dome. Outside the bubble, soft warm light glows but doesn't penetrate inside. Background is cool light blue-gray (#F0F4F8) with subtle frost-like geometric patterns. The figure is rendered in cool slate blue and silver tones. Feeling of self-protection and emotional distance. Simple geometric shapes, no facial features, rounded smooth forms. Modern editorial style. No text. --ar 1:1 --style raw --s 200
```

### 叠加文字建议

```
🧊 回避型
「我需要空间」
```

- 文字颜色：冷蓝灰 #334155 或深灰蓝 #1E293B
- 放置位置：图片底部或左下角

---

## 恐惧型 🌫️ 插图

### 关键词：矛盾、拉扯、迷雾、犹豫

```
Minimalist flat illustration, a single abstract human figure standing at a crossroads or split path, body slightly twisted as if being pulled in two directions simultaneously. Surrounded by soft misty fog that partially obscures the figure. Background is a muted lavender-gray (#F5F3FF) with ethereal cloud-like shapes. The figure is rendered in dusty purple and muted mauve tones. Feeling of inner conflict and ambivalence. Simple geometric shapes, no facial features, rounded smooth forms. Modern editorial style. No text. --ar 1:1 --style raw --s 200
```

### 叠加文字建议

```
🌫️ 恐惧型
「想靠近，又害怕受伤」
```

- 文字颜色：暗紫 #581C87 或灰紫 #6B21A8
- 放置位置：图片底部或左下角

---

## 四图统一风格要点

| 要素 | 规范 |
|------|------|
| 人物 | 抽象无面孔的人形剪影，圆润几何风格 |
| 风格 | 扁平插画、极简、编辑风（editorial illustration） |
| 配色 | 每张各自的色调，但饱和度和明度保持一致 |
| 背景 | 纯色/轻微纹理，不要复杂场景 |
| 情绪 | 安全=温暖稳定 / 焦虑=渴望紧张 / 回避=冷静疏离 / 恐惧=迷雾矛盾 |
| 质感 | 哑光、柔和，不要高光或3D效果 |

## 色彩对照表

| 类型 | 主色调 | 背景色 | 情绪色温 |
|------|--------|--------|---------|
| 安全型 | 暖金 / 赤陶 | #FFF8F0 | 暖 |
| 焦虑型 | 玫粉 / 珊瑚 | #FFF1F2 | 暖偏热 |
| 回避型 | 灰蓝 / 银灰 | #F0F4F8 | 冷 |
| 恐惧型 | 灰紫 / 薰衣草 | #F5F3FF | 冷偏暖 |

---

## Midjourney 通用后缀参数

```
--ar 1:1      # 文内插图用正方形
--ar 2.35:1   # 封面图用宽幅
--style raw   # 减少 Midjourney 的默认美化，更贴近 prompt
--s 200       # 中等风格化
--no photo realistic face text words letters  # 排除写实/人脸/文字
```

## 如果用 DALL-E

在 prompt 末尾加上：

```
Style: flat minimalist editorial illustration. Do not include any text, letters, words, or numbers in the image. Do not include realistic human faces.
```
