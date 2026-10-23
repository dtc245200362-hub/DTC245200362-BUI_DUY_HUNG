const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'booking_tour',
    user: process.env.DB_USER || 'booking_admin',
    password: process.env.DB_PASS || 'SecurePassword2026!@#',
});

// Khởi tạo bảng CSDL tự động nếu chưa tồn tại
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tours (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                price VARCHAR(50) NOT NULL,
                description TEXT,
                image_url TEXT
            );
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                tour_id INT REFERENCES tours(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        const res = await pool.query('SELECT COUNT(*) FROM tours');
        if (parseInt(res.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO tours (title, price, description, image_url) VALUES
                ('Tour Vịnh Hạ Long 3N2Đ', '3.990.000 VNĐ', 'Khám phá kỳ quan thiên nhiên thế giới trên du thuyền 5 sao.', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500'),
                ('Tour Đà Nẵng - Hội An 4N3Đ', '4.590.000 VNĐ', 'Trải nghiệm Cầu Vàng Bà Nà Hills và phố cổ Hội An rực rỡ.', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500'),
                ('Tour Phú Quốc Thiên Đường Biển', '5.290.000 VNĐ', 'Tận hưởng bãi biển xanh ngắt và vui chơi VinWonders.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500');
            `);
        }
        console.log('Database PostgreSQL setup successfully.');
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}

initDb();

// API Endpoint - Đặt Tour mới (Ghi vào DB)
app.post('/api/book', async (req, res) => {
    const { customer_name, phone, tour_id } = req.body;
    try {
        await pool.query('INSERT INTO bookings (customer_name, phone, tour_id) VALUES ($1, $2, $3)', [customer_name, phone, tour_id]);
        res.json({ success: true, message: 'Đặt tour thành công! Dữ liệu đã lưu vào PostgreSQL.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Render Trang Web động đọc dữ liệu trực tiếp từ PostgreSQL
app.get('/', async (req, res) => {
    try {
        const { rows: tours } = await pool.query('SELECT * FROM tours ORDER BY id ASC');
        const { rows: bookings } = await pool.query('SELECT b.id, b.customer_name, b.phone, t.title, b.created_at FROM bookings b JOIN tours t ON b.tour_id = t.id ORDER BY b.id DESC LIMIT 5');
        
        let tourCardsHtml = tours.map(t => `
            <div class="card">
                <div class="card-img" style="background-image: url('${t.image_url}');"></div>
                <div class="card-body">
                    <div class="card-title">${t.title}</div>
                    <p style="color:#666; font-size:0.9rem;">${t.description}</p>
                    <div class="price">${t.price}</div>
                    <form onsubmit="bookTour(event, ${t.id})" style="margin-top:10px;">
                        <input type="text" id="name-${t.id}" placeholder="Họ và tên người đặt" required style="width:100%; margin-bottom:6px; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <input type="text" id="phone-${t.id}" placeholder="Số điện thoại" required style="width:100%; margin-bottom:8px; padding:8px; border:1px solid #ccc; border-radius:4px;">
                        <button type="submit" class="btn">Xác Nhận Đặt Tour</button>
                    </form>
                </div>
            </div>
        `).join('');

        let bookingRowsHtml = bookings.map(b => `
            <tr>
                <td>#${b.id}</td>
                <td><b>${b.customer_name}</b></td>
                <td>${b.phone}</td>
                <td><span style="color:#0066eb; font-weight:bold;">${b.title}</span></td>
                <td>${new Date(b.created_at).toLocaleString('vi-VN')}</td>
            </tr>
        `).join('');

        res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ICTU Booking Tour - Dynamic Web App</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                body { background-color: #f4f7f6; color: #333; }
                header { background: linear-gradient(135deg, #0066eb, #003399); color: white; padding: 35px 20px; text-align: center; }
                .badge { background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; display: inline-block; margin-bottom: 10px; font-weight: bold; }
                .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 15px; }
                .card { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
                .card-img { height: 170px; background-size: cover; background-position: center; }
                .card-body { padding: 18px; }
                .card-title { font-size: 1.25rem; margin-bottom: 8px; color: #003399; font-weight: bold; }
                .price { font-size: 1.2rem; color: #e63946; font-weight: bold; margin: 8px 0; }
                .btn { width: 100%; background: #0066eb; color: white; padding: 10px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
                .btn:hover { background: #004bb5; }
                .section-title { margin-top: 40px; margin-bottom: 15px; color: #003399; font-size: 1.4rem; border-left: 4px solid #0066eb; padding-left: 10px; }
                table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
                th { background: #003399; color: white; }
                footer { text-align: center; padding: 25px; background: #222; color: #aaa; margin-top: 50px; }
            </style>
        </head>
        <body>
            <header>
                <span class="badge">● DYNAMIC APP ACTIVE: Node.js Express + PostgreSQL DB</span>
                <h1>Hệ Thống Đặt Tour Du Lịch ICTU</h1>
                <p>Sinh viên thực hiện: Bùi Duy Hưng - MSSV: DTC245200362 - Lớp CNTT-K23C</p>
            </header>
            <div class="container">
                <h2>Danh Sách Tour (Truy vấn động từ PostgreSQL)</h2>
                <div class="grid">${tourCardsHtml}</div>

                <h2 class="section-title">Lịch Sử Đặt Tour Real-time (Đã ghi vào Database `booking_tour`)</h2>
                <table>
                    <thead>
                        <tr><th>Mã Đơn</th><th>Khách Hàng</th><th>Số Điện Thoại</th><th>Tour Đã Đặt</th><th>Thời Gian Đặt</th></tr>
                    </thead>
                    <tbody>${bookingRowsHtml.length > 0 ? bookingRowsHtml : '<tr><td colspan="5" style="text-align:center; color:#888;">Chưa có đơn đặt tour nào trong CSDL. Hãy thử nhập thông tin và bấm Đặt Tour ở trên!</td></tr>'}</tbody>
                </table>
            </div>
            <footer>
                <p>© 2026 Bài Tập Lớn Triển Khai & Quản Trị Hệ Thống Phần Mềm - ĐH ICTU</p>
            </footer>
            <script>
                async function bookTour(e, tourId) {
                    e.preventDefault();
                    const name = document.getElementById('name-' + tourId).value;
                    const phone = document.getElementById('phone-' + tourId).value;
                    const res = await fetch('/api/book', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ customer_name: name, phone: phone, tour_id: tourId })
                    });
                    const data = await res.json();
                    alert(data.message || 'Thành công!');
                    location.reload();
                }
            </script>
        </body>
        </html>
        `);
    } catch (err) {
        res.status(500).send('Database connection error: ' + err.message);
    }
});

app.listen(80, () => {
    console.log('Dynamic Booking Webapp running on port 80...');
});
