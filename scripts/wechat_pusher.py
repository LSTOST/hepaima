# -*- coding: utf-8 -*-
"""
微信客服消息：推送依恋报告链接（知我实验室）。

文案规则：
- nickname 为空或「你」时，不使用「称呼，」前缀，首行固定为「你的依恋类型报告已生成 ✨」
- 其它昵称：「{nickname}，你的依恋类型报告已生成 ✨」

若希望全员统一无称呼文案，调用方始终传入 nickname="" 或 "你" 即可。
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.request
from typing import Any

logger = logging.getLogger(__name__)

WECHAT_CUSTOM_SEND = (
    "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token={token}"
)


def build_report_link_text(download_url: str, nickname: str = "") -> str:
    """
    组装文本客服消息正文（UTF-8）。

    固定尾部格式；首行按昵称决定是否带「称呼，」。
    """
    nick = (nickname or "").strip()
    if nick in ("", "你"):
        head = "你的依恋类型报告已生成 ✨"
    else:
        head = f"{nick}，你的依恋类型报告已生成 ✨"
    return (
        f"{head}\n\n"
        f"点击查看报告：\n{download_url}\n\n"
        "—— 知我实验室"
    )


def send_report_link(
    openid: str,
    download_url: str,
    nickname: str,
    access_token: str,
    timeout_sec: float = 10.0,
) -> bool:
    """
    调用微信客服消息接口发送文本（需有效 access_token）。

    :param openid: 用户在微信内的 openid
    :param download_url: 报告 H5 或下载链接
    :param nickname: 用户昵称；为「你」或空时不加称呼前缀
    :param access_token: 公众号/服务号 access_token
    """
    content = build_report_link_text(download_url, nickname=nickname)
    payload: dict[str, Any] = {
        "touser": openid,
        "msgtype": "text",
        "text": {"content": content},
    }
    url = WECHAT_CUSTOM_SEND.format(token=access_token)
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        logger.warning("wechat custom send HTTP %s: %s", e.code, err_body)
        return False
    except OSError as e:
        logger.warning("wechat custom send failed: %s", e)
        return False

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.warning("wechat custom send invalid JSON: %s", raw[:500])
        return False

    if data.get("errcode") not in (0, None):
        logger.warning(
            "wechat custom send errcode=%s errmsg=%s",
            data.get("errcode"),
            data.get("errmsg"),
        )
        return False
    return True
