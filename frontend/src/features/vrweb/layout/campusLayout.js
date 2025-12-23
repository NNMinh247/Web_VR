export function buildCampusCards(campuses, toPublicUrl) {
  const url = typeof toPublicUrl === "function" ? toPublicUrl : (v) => v;
  const safeIndex = (i, fallback = 0) => {
    if (!Array.isArray(campuses) || !campuses.length) return 0;
    if (i >= 0 && i < campuses.length) return i;
    return Math.min(fallback, campuses.length - 1);
  };

  return [
    { title: "CƠ SỞ HÀ ĐÔNG", thumb: url("thumb-hd.jpg"), targetIndex: safeIndex(0) },
    { title: "CƠ SỞ NGỌC TRỤC", thumb: url("thumb-nt.jpg"), targetIndex: safeIndex(1, 0) },
  ];
}
