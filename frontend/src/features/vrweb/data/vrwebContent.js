export const HISTORY_FALLBACK = [
  { id: 1, year_date: "07/09/1953", title: "Thành lập Đại học Bưu điện – Vô tuyến điện", description: "Tiền thân của Học viện ngày nay.", image: "moc-1.jpg" },
  { id: 2, year_date: "17/09/1966", title: "Thành lập Viện Khoa học Kỹ thuật Bưu điện RIPT", description: "", image: "moc-2.jpg" },
  { id: 3, year_date: "08/04/1975", title: "Thành lập Viện Kinh tế Bưu điện ERIPT", description: "", image: "moc-3.jpg" },
  { id: 4, year_date: "28/05/1988", title: "Thành lập Trung tâm Đào tạo BCVT II (PTTC2)", description: "", image: "moc-4.jpg" },
  { id: 5, year_date: "11/07/1997", title: "Thành lập Học viện Công nghệ Bưu chính Viễn thông", description: "Sắp xếp lại 4 đơn vị: PTTC1, PTTC2, Viện KHKT Bưu điện, Viện Kinh tế Bưu điện.", image: "moc-5.jpg" },
  { id: 6, year_date: "17/09/1997", title: "Công bố Quyết định thành lập", description: "Chính thức ra mắt Học viện Công nghệ BCVT.", image: "moc-6.jpg" },
  { id: 7, year_date: "22/03/1999", title: "Thành lập Trung tâm CDIT", description: "Trung tâm Công nghệ thông tin trực thuộc Học viện.", image: "moc-7.jpg" },
  { id: 8, year_date: "01/07/2014", title: "Chuyển về Bộ Thông tin và Truyền thông", description: "Điều chuyển từ Tập đoàn VNPT về Bộ TTTT, tự chủ tài chính.", image: "moc-8.jpg" },
  { id: 9, year_date: "27/02/2025", title: "Quy hoạch trở thành ĐH trọng điểm Quốc gia", description: "Theo Quyết định số 452/QĐ-TTg của Thủ tướng Chính phủ.", image: "moc-9.jpg" },
];

export const NAV_ITEMS = [
  { key: "nav:intro", label: "Giới thiệu" },
  { key: "nav:history", label: "Lịch sử" },
  { key: "nav:achievements", label: "Thành tựu" },
  { key: "nav:partners", label: "Đối tác" },
  { key: "nav:campus", label: "Khám phá cơ sở" },
];

export function mergeHistoryWithFallback(list) {
  const base = Array.isArray(list) ? list : [];
  const keyOf = (item) => `${item?.year_date || ""}__${item?.title || ""}`.toLowerCase();
  const existing = new Set(base.map(keyOf));
  const missing = HISTORY_FALLBACK.filter((item) => !existing.has(keyOf(item)));
  return [...base, ...missing];
}
