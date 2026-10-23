# BÀI TẬP LỚN: HỆ THỐNG BOOKING TOUR / DU LỊCH (MICROSERVICES)

## 📌 THÔNG TIN SINH VIÊN
* **Họ và tên:** Bùi Duy Hưng
* **Mã số sinh viên (MSSV):** DTC245200362
* **Lớp / Khóa:** CNTT-K23C
* **Học phần:** Triển khai và Quản trị Hệ thống Phần mềm
* **Trường:** Đại học Công nghệ Thông tin & Truyền thông (ICTU)

---

## 🛠 TỔNG QUAN KIẾN TRÚC HỆ THỐNG
Hệ thống Booking Tour được triển khai theo mô hình **Microservices Containerized** trên nền tảng Docker & Docker Compose, bao gồm **9 dịch vụ containerized** chạy độc lập nhưng kết nối chặt chẽ với nhau:

1. **Gateway / Reverse Proxy:** Nginx Reverse Proxy tiếp nhận request qua HTTPS (port 443), tự động chuyển hướng HTTP (port 80) và đính kèm các Security Headers bảo mật.
2. **Web Application:** Container ứng dụng web đại diện cho hệ thống Booking Tour.
3. **Database Layer:** PostgreSQL 15 quản trị dữ liệu chính, kết hợp Adminer GUI (port 8080) giúp truy vấn và quản lý CSDL trực quan.
4. **Metrics Monitoring:** Prometheus (port 9090) cào metrics từ Node-Exporter (port 9100) và hệ thống, kết nối tới Grafana (port 3000) để trực quan hóa biểu đồ.
5. **Centralized Logging:** Promtail thu thập log toàn bộ Docker containers và Nginx, đẩy về Loki Log Server (port 3100) để truy vấn theo ngôn ngữ LogQL.

---

## 🌐 BẢNG BÀN GIAO CỔNG DỊCH VỤ (PORTS MATRIX)

| Dịch vụ | Container Name | Cổng Nội bộ | Cổng Public | Chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| **Nginx Proxy** | `booking_proxy` | 80, 443 | `80`, `443` | Reverse Proxy, SSL Certificate & Security Gateway |
| **Web App** | `booking_webapp` | 80 | Internal | Microservice giao diện Booking Web |
| **PostgreSQL** | `booking_db` | 5432 | Internal | Cơ sở dữ liệu quan hệ lưu trữ dữ liệu Tour |
| **Adminer** | `booking_adminer` | 8080 | `8080` | Giao diện Web quản trị CSDL PostgreSQL |
| **Prometheus** | `booking_prometheus` | 9090 | `9090` | Thu thập & lưu trữ thông số Metrics thời gian thực |
| **Grafana** | `booking_grafana` | 3000 | `3000` | Trực quan hóa Dashboard theo dõi trạng thái hệ thống |
| **Node Exporter** | `booking_node_exporter`| 9100 | Internal | Xuất dữ liệu phần cứng máy chủ (CPU, RAM, Disk) |
| **Loki** | `booking_loki` | 3100 | `3100` | Log Aggregator lưu trữ & chỉ mục hóa tập trung |
| **Promtail** | `booking_promtail` | 9080 | Internal | Log Agent thu thập log từ Docker container socket |

---

## 🔐 BẢO MẬT VÀ AN TOÀN HẠ TẦNG (HARDENING)
* **Non-root Execution:** Các tiến trình ứng dụng và Nginx worker được phân quyền chạy dưới dạng non-root user (`uuidd`/`nginx`), loại bỏ nguy cơ leo thang đặc quyền (privilege escalation).
* **Network Isolation:** Phân tách rõ ràng thành các mạng nội bộ `frontend-network`, `backend-network` (internal flag), và `monitoring-network`.
* **Security Headers:** Nginx cấu hình sẵn `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, và `X-XSS-Protection: 1; mode=block`.
* **Encrypted SSL/TLS:** Mọi lưu lượng web đều bắt buộc qua giao thức bảo mật HTTPS với TLSv1.2/TLSv1.3.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 1. Yêu cầu môi trường
* Hệ điều hành: Ubuntu 20.04 LTS trở lên / Linux distribution
* Đã cài đặt `docker` (v20.10+) và `docker-compose-plugin` (v2.0+)

### 2. Các bước triển khai
```bash
# Clone repository về máy
git clone [https://github.com/dtc245200362-hub/DTC245200362-BUI_DUY_HUNG.git](https://github.com/dtc245200362-hub/DTC245200362-BUI_DUY_HUNG.git)
cd DTC245200362-BUI_DUY_HUNG

# Khởi chạy đồng loạt 9 microservices dưới dạng background daemon
docker compose up -d

# Kiểm tra trạng thái hoạt động của các container
docker compose ps
