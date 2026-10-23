# HỆ THỐNG BOOKING TOUR / DU LỊCH (MICROSERVICES)

## 📌 Thông Tin Sinh Viên

* **Họ và tên:** Bùi Duy Hưng
* **Mã sinh viên:** DTC245200362
* **Lớp:** CNTT-K23C
* **Trường:** Đại học Công nghệ Thông tin & Truyền thông (ICTU)
* **Môn học:** Quản trị Hệ thống / Quản trị CSDL & Hạ tầng Cloud

## 📖 Giới Thiệu Dự Án

Dự án triển khai một hệ thống **Booking Tour / Du lịch** hoàn chỉnh theo kiến trúc **Microservices** hiện đại, được đóng gói hoàn toàn trong các Docker Container và điều phối qua `Docker Compose`.

Hệ thống tích hợp đầy đủ các giải pháp cho hạ tầng sản xuất (Production-ready):

1. **Reverse Proxy & TLS Encryption:** Nginx đóng vai trò API Gateway, điều hướng lưu lượng và mã hóa SSL/TLS.
2. **Database Management:** PostgreSQL 15 lưu trữ dữ liệu ứng dụng, đi kèm Adminer làm giao diện quản trị GUI.
3. **Metrics Monitoring:** Prometheus thu thập chỉ số hiệu năng (Metrics) từ Node Exporter và hiển thị trực quan qua Grafana Dashboard.
4. **Centralized Logging:** Loki kết hợp với Promtail thu thập và quản lý log tập trung cho toàn bộ 9 container trong hạ tầng.
5. **Security Hardening:** Áp dụng nguyên tắc đặc quyền tối thiểu (Least Privilege), chạy ứng dụng dưới dạng user không có quyền root (`non-root`).

## 🏗 Kiến Trúc Hệ Thống (9 Microservices)

```
                       [ Client / Web Browser ]
                                  │
                                  ▼
                   ┌──────────────────────────────┐
                   │  Nginx Reverse Proxy Gateway │ (Ports 80/443 SSL)
                   └──────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Webapp Booking  │      │ Adminer GUI     │      │ Grafana UI      │
│ (Frontend/App)  │      │ (Port 8080)     │      │ (Port 3000)     │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         ▼                        ▼                        │
┌──────────────────────────────────────────┐               │
│ PostgreSQL Database (Port 5432)          │               │
└──────────────────────────────────────────┘               │
                                                           │
┌──────────────────────────────────────────────────────────┘
│
├─────────────────────────┐
▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│ Prometheus UI    │    │ Loki Log Server  │
│ (Port 9090)      │    │ (Port 3100)      │
└────────▲─────────┘    └────────▲─────────┘
         │                       │
┌────────┴─────────┐    ┌────────┴─────────┐
│ Node Exporter    │    │ Promtail Agent   │
│ (Port 9100)      │    │ (Log Collector)  │
└──────────────────┘    └──────────────────┘
```

## 📂 Cấu Trúc Thư Mục Dự Án

```
booking-tour-system/
├── docker-compose.yml          # Tệp điều phối toàn bộ 9 containers
├── README.md                   # Tài liệu hướng dẫn dự án
├── .gitignore                  # Cấu hình bỏ qua các dữ liệu rác/database
├── nginx/                      # Cấu hình Gateway Proxy & SSL
│   ├── nginx.conf
│   └── ssl/
├── prometheus/                 # Cấu hình thu thập Metrics
│   └── prometheus.yml
├── loki/                       # Cấu hình lưu trữ Log tập trung
│   └── loki-config.yaml
└── promtail/                   # Cấu hình Agent gom Log
    └── promtail-config.yaml
```

## 🌐 Các Dịch Vụ & Thông Số Cổng Access

| Dịch vụ (Container) | Công dụng | Địa chỉ / Port truy cập | Tài khoản mặc định | 
| ----- | ----- | ----- | ----- | 
| **Nginx Proxy** | Reverse Proxy SSL/TLS Gateway | `https://localhost` | N/A | 
| **Adminer** | Quản trị GUI Database PostgreSQL | `http://localhost:8080` | Server: `db`, DB: `booking_db` | 
| **Grafana** | Dashboard hiển thị Metrics & Logs | `http://localhost:3000` | `admin` / `admin` | 
| **Prometheus** | Hệ thống thu thập chỉ số hiệu năng | `http://localhost:9090` | N/A | 
| **Node Exporter** | Thu thập Metrics từ OS máy chủ | `http://localhost:9100/metrics` | N/A | 
| **Loki** | Log Aggregator Engine | `http://localhost:3100` | N/A | 

## 🛠 Hướng Dẫn Cài Đặt & Vận Hành

### 1. Tiền đề yêu cầu

* Hệ điều hành Linux (Ubuntu 20.04/22.04 LTS khuyên dùng)
* Docker Engine ($\ge$ v20.10) & Docker Compose Plugin ($\ge$ v2.0)
* Git Command Line Tool

### 2. Tải mã nguồn về máy local

```bash
git clone https://github.com/dtc245200362-hub/DTC245200362-BUI_DUY_HUNG.git
cd DTC245200362-BUI_DUY_HUNG
```

### 3. Khởi chạy toàn bộ hệ thống

Khởi động tất cả 9 dịch vụ dưới dạng chế độ chạy ngầm (Background / Detached mode):

```bash
docker compose up -d
```

### 4. Kiểm tra trạng thái hoạt động các Containers

```bash
docker compose ps
```

*Đảm bảo tất cả các container đều ở trạng thái `Up` hoặc `running`.*

### 5. Dừng và dọn dẹp hệ thống khi cần

```bash
docker compose down
```

## 🔐 Bảo Mật & Tối Ưu Hạ Tầng (Hardening)

* **SSL/TLS Self-Signed Encryption:** Toàn bộ lưu lượng truy cập Webapp được điều hướng bắt buộc qua giao thức HTTPS bảo mật (`Port 443`).
* **Non-Root User Standard:** Dịch vụ Web, Prometheus, Grafana và Loki được cấu hình chạy dưới tài khoản người dùng hạn chế (`UID/GID 1000/10001`), ngăn chặn khai thác leo thang đặc quyền (Privilege Escalation).
* **Isolate Network:** Cấu hình Docker Custom Network để phân tách lưu lượng giữa DB internal và các dịch vụ public Gateway.

## 📜 Lịch Sử Đóng Góp (Git Commit History)

* **Commit 1:** `Setup microservices infrastructure with Nginx SSL proxy and Adminer` - Khởi tạo hạ tầng cốt lõi Nginx Gateway, Webapp, PostgreSQL và Adminer.
* **Commit 2:** `Integrate Prometheus metrics scraper and Grafana dashboard` - Tích hợp bộ đôi giám sát chỉ số hệ thống Prometheus và Grafana.
* **Commit 3:** `Add Loki & Promtail log aggregation system and non-root security hardening` - Tích hợp hệ thống quản lý log tập trung Loki/Promtail và gia cố bảo mật Container non-root.

