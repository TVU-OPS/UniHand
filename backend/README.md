# 🚀 Cài đặt và sử dụng Strapi

Strapi là một nền tảng CMS mã nguồn mở, mạnh mẽ và dễ sử dụng, được thiết kế để giúp bạn xây dựng và quản lý nội dung cho các ứng dụng web hoặc di động một cách nhanh chóng. Với khả năng tùy chỉnh cao, Strapi cho phép các nhà phát triển linh hoạt trong việc mở rộng tính năng và tích hợp dịch vụ bên thứ ba.

---

# ![UniHand Banner](./public/backend.png)

## 🛠️ Yêu cầu hệ thống

### 1. **Phần mềm**

- **Node.js**: Phiên bản >= **14.x** và < **20.x**.  
  [Tải Node.js tại đây](https://nodejs.org).
- **npm** hoặc **yarn**: Công cụ quản lý gói (thường đi kèm khi cài Node.js).
  - **npm** >= 6.x
  - **yarn** >= 1.x

### 2. **Cơ sở dữ liệu: MySQL**

- Phiên bản yêu cầu: **MySQL >= 5.7** hoặc **MariaDB >= 10.3**.
- Cần chuẩn bị:
  - Tạo một cơ sở dữ liệu MySQL trước khi chạy ứng dụng.

### 3. **Hệ điều hành**

- **Windows** (khuyến nghị).
- **Linux**.
- **macOS**.

### 4. **Dung lượng**

- Dung lượng ổ cứng: Tối thiểu 1GB trống (tùy thuộc vào kích thước dự án).
- RAM: Tối thiểu **2GB** (khuyến nghị **4GB** để đảm bảo hiệu suất tốt hơn).

---

## 🛠️ Cài đặt dự án

### 1. Clone dự án từ GitHub

```bash
git clone https://github.com/TVU-OPS/UniHand.git
```

### 2. Di chuyển vào thư mục dự án

```bash
cd UniHand/backend
```

### 3. Tạo file `.env` từ file mẫu `.env.example`

```bash
cp .env.example .env
```

- Chỉnh sửa thông tin cần thiết trong tệp .env.

### 4. Cài đặt các gói phụ thuộc

```bash
npm install
```

---

# 🚀 Sử dụng Strapi

Strapi đi kèm với một [Giao diện Dòng Lệnh (CLI)](https://docs.strapi.io/dev-docs/cli) đầy đủ tính năng, cho phép bạn thiết lập và quản lý dự án trong vài giây.

## `develop`

Khởi động ứng dụng Strapi của bạn với chế độ **tự động tải lại (autoReload)**.  
[Tìm hiểu thêm](https://docs.strapi.io/dev-docs/cli#strapi-develop).

```bash
npm run develop
# hoặc
yarn develop
```

### `start`

Khởi động ứng dụng Strapi với chế độ không tự động tải lại. [Tìm hiểu thêm](https://docs.strapi.io/dev-docs/cli#strapi-start)

```bash
npm run start
# hoặc
yarn start
```

### `build`

Build giao diện quản trị của Strapi. [Tìm hiểu thêm](https://docs.strapi.io/dev-docs/cli#strapi-build)

```bash
npm run build
# hoặc
yarn build
```

## ⚙️ Triển khai

Strapi cung cấp nhiều phương án triển khai ứng dụng, bao gồm cả [Strapi Cloud](https://cloud.strapi.io). Truy cập [tài liệu triển khai để tìm giải pháp phù hợp nhất cho dự án của bạn. ](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Tìm hiểu thêm

- [Resource center](https://strapi.io/resource-center) - Nguồn tài nguyên Strapi.
- [Strapi documentation](https://docs.strapi.io) - Tài liệu chính thức của Strapi.
- [Strapi tutorials](https://strapi.io/tutorials) - Danh sách các hướng dẫn từ đội ngũ phát triển và cộng đồng.
- [Strapi blog](https://strapi.io/blog) - Blog chính thức của Strapi với các bài viết từ đội ngũ và cộng đồng.
- [Changelog](https://strapi.io/changelog) Theo dõi các bản cập nhật sản phẩm, tính năng mới và cải tiến chung.

Hãy xem qua [kho lưu trữ GitHub của Strapi](https://github.com/strapi/strapi). Rất mong nhận được phản hồi và sự đóng góp của bạn!

## ✨ Cộng đồng Strapi

- [Discord](https://discord.strapi.io) - Tham gia trò chuyện với cộng đồng Strapi, bao gồm cả đội ngũ phát triển.
- [Forum](https://forum.strapi.io/) - Nơi thảo luận, đặt câu hỏi và tìm câu trả lời, chia sẻ dự án Strapi và nhận ý kiến đóng góp từ cộng đồng.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - Danh sách tổng hợp các tài nguyên tuyệt vời liên quan đến Strapi.

---

🤫 Psst! [Strapi is hiring](https://strapi.io/careers).
