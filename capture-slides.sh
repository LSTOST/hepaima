#!/bin/bash
# 用本机 Chrome Headless 截取 9 张小红书配图
# 输出：xiaohongshu-output/01.png ~ 09.png（2160×2880，2x 清晰度）

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HTML_BASE="file://${SCRIPT_DIR}/xiaohongshu-slides.html"
OUTDIR="${SCRIPT_DIR}/xiaohongshu-output"

mkdir -p "$OUTDIR"

echo ""
echo "  小红书配图导出工具"
echo "  ─────────────────"
echo ""

for i in $(seq 1 9); do
  PADDED=$(printf "%02d" $i)
  OUTFILE="${OUTDIR}/${PADDED}.png"

  "$CHROME" \
    --headless=new \
    --no-sandbox \
    --disable-gpu \
    --disable-extensions \
    --window-size=1080,1440 \
    --force-device-scale-factor=2 \
    --screenshot="$OUTFILE" \
    --hide-scrollbars \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=8000 \
    "${HTML_BASE}?slide=${i}" \
    2>/dev/null

  if [ -f "$OUTFILE" ]; then
    DIMS=$(sips -g pixelWidth -g pixelHeight "$OUTFILE" 2>/dev/null | awk '/pixel/{printf "%s", $2; if(NR==2) printf "×"}')
    SIZE=$(du -h "$OUTFILE" | cut -f1)
    echo "  ✓  第 ${i} 张  →  ${PADDED}.png    ${DIMS}    ${SIZE}"
  else
    echo "  ✗  第 ${i} 张失败"
  fi
done

echo ""
echo "  完成！文件在: $OUTDIR"
echo ""
open "$OUTDIR"
