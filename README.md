# 📖 HƯỚNG DẪN CÀI ĐẶT WEBSITE PTIT EDU (FULLSTACK)
---

## 🛠 PHẦN 1: CÀI ĐẶT CÔNG CỤ CẦN THIẾT

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài 3 phần mềm sau (nếu có rồi thì bỏ qua):

1.  **Node.js** 
2.  **MySQL**
3.  **Visual Studio Code** 
4.  **Git** 

---

## 📥 PHẦN 2: TẢI CODE VỀ MÁY (CLONE)


## 🗄 PHẦN 3: CÀI ĐẶT CƠ SỞ DỮ LIỆU (DATABASE)

- Mở MySQL Workbench, đặt tên csdl là ptit_edu
- Sửa lại các thông tin như tên, mật khẩu, ... để kết nối chuẩn

## ⚙️ PHẦN 4: CÀI ĐẶT BACKEND (SERVER)


1.  Trong Visual Studio Code, mở **Terminal** (Phím tắt: `Ctrl + J` hoặc menu Terminal -> New Terminal).
2.  Nhập lệnh sau để vào thư mục backend:
    ```bash
    cd backend
    ```
3.  **QUAN TRỌNG:** Chạy lệnh sau để máy tự động tải các thư viện về (Express, MySQL, Nodemailer...):
    ```bash
    npm install
    ```
    *(Chờ khoảng 1-2 phút đến khi chạy xong).* Nếu chạy lỗi gì thì tham khảo AI :D
4.  **Tạo file cấu hình bảo mật:**
    * Nhìn sang cột danh sách file bên trái, trong thư mục `backend`, chuột phải vào vùng trống chọn **New File**.
    * Đặt tên file là `.env` (có dấu chấm ở đầu).
    * Copy nội dung dưới đây dán vào file `.env` đó và lưu lại (`Ctrl + S`):
    Phần này lấy API Key của Gemini AI và thông tin email để gửi mail xác nhận cho người dùng đăng ký.
    ```env
    PORT=5000
    GEMINI_API_KEY=

    EMAIL_USER=
    EMAIL_PASS=
    ```

---

## 🎨 PHẦN 5: CÀI ĐẶT FRONTEND (GIAO DIỆN)

*Bước này giúp tải ReactJS, thư viện 3D, Slider... về máy.*

1.  Vẫn ở Terminal, mở thêm một tab Terminal mới (bấm dấu `+` ở góc phải bảng Terminal).
2.  Nhập lệnh để vào thư mục frontend:
    ```bash
    cd frontend
    ```
3.  **QUAN TRỌNG:** Chạy lệnh sau để tải toàn bộ thư viện giao diện (React, Three.js, Slick...):
    ```bash
    npm install
    ```
    *(Bước này sẽ tốn khoảng 3-5 phút, hãy kiên nhẫn chờ. Nếu thấy chữ "warning" màu vàng thì kệ nó, miễn không báo "error" màu đỏ là được).*

---

## 🚀 PHẦN 6: CHẠY DỰ ÁN (START)

Để web chạy được, bạn cần bật cả 2 terminal cùng lúc.

**Terminal 1 (Backend):**
* Đang ở thư mục `backend`, gõ lệnh:
    ```bash
    node server.js
    ```
* Thấy báo: `✅ Kết nối MySQL thành công!` là OK.

**Terminal 2 (Frontend):**
* Đang ở thư mục `frontend`, gõ lệnh:
    ```bash
    npm start
    ```
* Chờ một chút, trình duyệt sẽ tự bật trang web lên tại địa chỉ: `http://localhost:3000`

---

### ❓ Xử lý lỗi thường gặp: tham khảo AI hoặc ib :D