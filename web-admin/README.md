# **Hướng dẫn cài đặt và chạy web-admin**

## **Giới thiệu**
Thư mục `web-admin` chứa mã nguồn của trang quản trị được xây dựng bằng **Noodl**. Dưới đây là hướng dẫn từng bước để cài đặt **Noodl**, thiết lập môi trường và chạy dự án.

---

## **Yêu cầu hệ thống**
Trước khi bắt đầu, hãy đảm bảo hệ thống của bạn đáp ứng các yêu cầu sau:
- **Node.js**: Phiên bản >= 16.x.
- **npm**: Phiên bản >= 8.x.
- **Docker** (nếu cần chạy qua container, không bắt buộc).
- **Git**: Để sao chép dự án từ GitHub.

---

## **Hướng dẫn cài đặt**

### **Bước 1: Clone dự án từ GitHub**
Sao chép mã nguồn của dự án về máy bằng lệnh:

```bash
git clone https://github.com/TVU-OPS/UniHand.git
```

Di chuyển vào thư mục **web-admin**

```bash
cd UniHand/web-admin
```

### **Bước 2: Cài đặt Noodl**
Cài đặt Noodl CLI
- Cài đặt Noodl CLI qua npm:
```bash
npm install -g @noodl/noodl-cli
```
- Kiểm tra xem Noodl CLI đã được cài đặt thành công chưa:
```bash 
noodl --version
```

## **Tài liệu tham khảo**
[Tài liệu chính thức của Noodl](https://noodlapp.github.io/noodl-docs/)
[Kho GitHub của dự án](https://github.com/TVU-OPS/UniHand)