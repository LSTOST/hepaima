# -*- coding: utf-8 -*-
"""
依恋报告 PDF 样式常量（DESIGN.md §9 PDF Report Specs）。

与 H5 共用色值；实际渲染请使用内嵌 Noto Serif SC / Noto Sans SC，
勿依赖系统字体。可与 WeasyPrint、reportlab 等对接。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final

# --- 页面（mm） ---
PAGE_WIDTH_MM: Final = 210
PAGE_HEIGHT_MM: Final = 297
MARGIN_TOP_MM: Final = 20
MARGIN_BOTTOM_MM: Final = 20
MARGIN_LEFT_MM: Final = 18
MARGIN_RIGHT_MM: Final = 18
CONTENT_WIDTH_MM: Final = PAGE_WIDTH_MM - MARGIN_LEFT_MM - MARGIN_RIGHT_MM  # 174

# --- 色板（与 DESIGN.md / globals.css 一致） ---
COLORS: Final[dict[str, str]] = {
    "primary": "#7C5CBF",
    "ink": "#1A1A2E",
    "ink_secondary": "#4A4A6A",
    "ink_tertiary": "#8A8AAA",
    "border": "#E8E4F0",
    "surface": "#FAFAF8",
    "surface_raised": "#FFFFFF",
    "type_secure": "#4CAF87",
    "type_anxious": "#E8A838",
    "type_avoidant": "#5B8FC9",
    "type_fearful": "#9B6B9E",
}

TYPE_CODE_TO_COLOR_KEY: Final[dict[str, str]] = {
    "SECURE": "type_secure",
    "ANXIOUS": "type_anxious",
    "AVOIDANT": "type_avoidant",
    "FEARFUL": "type_fearful",
}


def type_hex(type_code: str) -> str:
    key = TYPE_CODE_TO_COLOR_KEY.get(type_code.strip().upper())
    return COLORS[key] if key else COLORS["primary"]


# --- 字体层级（pt）---
@dataclass(frozen=True)
class PdfFonts:
    """DESIGN.md §9：字体层级（PDF）"""

    h1_chapter_pt: float = 18  # Noto Serif SC Bold, --color-ink
    h2_section_pt: float = 14  # Noto Sans SC Bold, --color-primary
    h3_pattern_pt: float = 12  # Noto Sans SC Bold, --color-ink
    body_pt: float = 11  # Noto Sans SC Regular, 行高 1.8, --color-ink
    caption_pt: float = 9  # Noto Sans SC Light, --color-ink-tertiary
    cover_type_name_pt: float = 28  # Noto Serif SC, 类型主题色
    cover_subtitle_pt: float = 16  # 依恋类型深度解读报告，次要文字
    watermark_pt: float = 8


PDF_FONTS = PdfFonts()

# --- 封面 ---
COVER_LOGO_TOP_SPACER_MM: Final = 40  # 大留白约 40mm
COVER_TYPE_DISC_MM: Final = 60  # 类型色圆直径 60mm

# --- 坐标轴图（第 2 页） ---
QUADRANT_FILL_ALPHA: Final = 0.10
AXIS_TICK_MIN: Final = 1
AXIS_TICK_MAX: Final = 7
USER_DOT_DIAMETER_PX: Final = 8

# --- 章节分隔 ---
SECTION_RULE_PT: Final = 24  # margin 24pt 0; border-top 1px solid border

# --- 卡片（若用 HTML→PDF）---
CARD_SHADOW_CSS: Final = "0 2px 12px rgba(124, 92, 191, 0.06)"
CARD_RADIUS_PX: Final = 16
CARD_BORDER: Final = f"1px solid {COLORS['border']}"


def watermark_line(nickname: str, date_str: str) -> str:
    """每页底部居中水印文案。"""
    nick = nickname.strip() or "用户"
    return f"知我实验室出品 · {date_str} · 仅供{nick}个人参考"


def cover_subtitle_text() -> str:
    return "依恋类型深度解读报告"
