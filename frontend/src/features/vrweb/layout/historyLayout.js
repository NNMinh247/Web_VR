export function computeHistoryLayout(historyList) {
  const list = Array.isArray(historyList) ? historyList : [];

  const estimateDescHeight = (text) => {
    if (!text) return 0;
    const charsPerLine = 48;
    const lines = Math.max(1, Math.ceil(String(text).length / charsPerLine));
    return Math.min(0.42, 0.08 + lines * 0.05);
  };

  const cardHeights = list.map((item) => {
    const hasImg = !!item?.image;
    const descH = estimateDescHeight(item?.description || "");
    const base = 0.38; // badge + title + extra padding for multiline titles
    const imgH = hasImg ? 0.36 : 0;
    const h = Math.max(0.52, base + descH + imgH);
    return h;
  });

  const gap = 0.24;
  const totalCards = cardHeights.reduce((a, b) => a + b, 0);
  const totalGap = cardHeights.length > 1 ? (cardHeights.length - 1) * gap : 0;
  const stackHeight = totalCards + totalGap;
  return { cardHeights, gap, stackHeight };
}
