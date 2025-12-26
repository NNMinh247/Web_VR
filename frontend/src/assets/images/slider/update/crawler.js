// npm install axios cheerio

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// 1. Danh sách các đường link quan trọng bạn muốn AI học
// (Bạn có thể thêm bớt link tùy ý)
const URLS_TO_LEARN = [
    'https://portal.ptit.edu.vn/gioi-thieu/',          // Giới thiệu chung
    'https://portal.ptit.edu.vn/tuyen-sinh/',          // Thông tin tuyển sinh
    'https://portal.ptit.edu.vn/dao-tao-dai-hoc/',     // Các ngành đào tạo
    'https://portal.ptit.edu.vn/co-so-vat-chat/',      // Cơ sở vật chất (nếu có link cụ thể)
];

// Hàm làm sạch văn bản (xóa khoảng trắng thừa, xuống dòng linh tinh)
const cleanText = (text) => {
    return text.replace(/\s+/g, ' ').trim();
};

const crawlData = async () => {
    console.log("🚀 Bắt đầu thu thập dữ liệu từ Website PTIT...");
    let fullKnowledge = "DỮ LIỆU TỰ ĐỘNG CẬP NHẬT TỪ PTIT.EDU.VN:\n\n";

    for (const url of URLS_TO_LEARN) {
        try {
            console.log(`- Đang đọc: ${url}`);
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            // --- TÙY CHỈNH PHẦN LẤY DỮ LIỆU ---
            // Website PTIT thường để nội dung chính trong thẻ div có class là 'post-content' hoặc 'entry-content'
            // Chúng ta sẽ lấy tất cả thẻ p (đoạn văn) và li (danh sách) trong đó.
            
            const title = $('h1').first().text().trim(); // Lấy tiêu đề bài viết
            let content = "";

            // Lấy nội dung từ vùng bài viết chính (tránh lấy menu, footer rác)
            $('.post-content, .entry-content, #main-content').find('p, li, h2, h3').each((i, el) => {
                content += $(el).text() + "\n";
            });

            if (content.length > 50) {
                fullKnowledge += `=== NGUỒN: ${title} (${url}) ===\n${cleanText(content)}\n\n`;
            }

        } catch (error) {
            console.error(`❌ Lỗi khi đọc ${url}:`, error.message);
        }
    }

    // Xuất ra file module giống hệt cách thủ công bạn làm trước đó
    const fileContent = `const data = \`${fullKnowledge.replace(/`/g, "'")}\`;\nmodule.exports = data;`;

    fs.writeFileSync('ptit_data.js', fileContent);
    console.log("✅ Đã cập nhật xong dữ liệu vào file ptit_data.js!");
};

crawlData();