# 🚀 Hướng dẫn chạy ứng dụng React Native

Ứng dụng **React Native** trong dự án này nằm trong thư mục `app-mobile`. Dưới đây là hướng dẫn để tải dự án, di chuyển vào thư mục `app-mobile`, và chạy ứng dụng trên máy ảo điện thoại.

# ![UniHand Banner](./assets/images/app_mobile.png)

---

## 🛠️ Yêu cầu hệ thống

### 1. **Phần mềm cần thiết**

- **Node.js**: Phiên bản >= **14.x** và < **20.x**.  
  [Tải Node.js tại đây](https://nodejs.org).
- **npm** hoặc **yarn**: Công cụ quản lý gói.
  - **npm** >= 6.x
  - **yarn** >= 1.x
- **React Native CLI**: Công cụ CLI để phát triển ứng dụng React Native.  
  Cài đặt bằng lệnh:

  ```bash
  npm install -g react-native-cli

  ```

- **Android Studio** (cho máy ảo Android):

  - [Tải Android Studio](https://developer.android.com/studio).
  - Cần bật tính năng Android Virtual Device (AVD) để tạo máy ảo.

### 2. Cấu hình môi trường

- Java Development Kit (JDK): Phiên bản 8 hoặc 11. [Tải JDK tại đây.](https://www.oracle.com/java/technologies/downloads/?er=221886)

- Android SDK: Cài đặt qua Android Studio.

Lưu ý: Đảm bảo bạn đã cấu hình các biến môi trường JAVA_HOME, ANDROID_HOME và thêm platform-tools của Android SDK vào PATH.

## 🔧 Hướng dẫn cài đặt và chạy ứng dụng

### 1. Clone dự án từ GitHub

```bash
git clone https://github.com/TVU-OPS/UniHand.git
```

### 2. Di chuyển vào thư mục app-mobile

```bash
cd UniHand/app-mobile
```

### 3. Cài đặt các phụ thuộc

Cài đặt tất cả các gói cần thiết:

```bash
npm install

# hoặc
yarn install
```

### 4. Chạy ứng dụng trên máy ảo

#### 4.1. Bật máy ảo Android

- Mở Android Studio.
- Chuyển đến AVD Manager và khởi chạy máy ảo bạn đã tạo.

#### 4.2. Chạy ứng dụng React Native

Sử dụng lệnh sau để chạy ứng dụng trên máy ảo Android:

```bash
npm run android
# hoặc
yarn android
```

## ⚙️ Các lệnh CLI hữu ích

### Khởi động ứng dụng trên máy ảo

```bash
npm run android
# hoặc
yarn android
```

### Chạy ứng dụng trên thiết bị thật (Android)

Kết nối thiết bị Android qua USB và chạy:

```bash
npm run android
# hoặc
yarn android
```

## 📚 Tài liệu tham khảo

- [Hướng dẫn React Native](https://reactnative.dev/docs/getting-started)- Thiết lập môi trường React Native.

- [Hướng dẫn máy ảo Android](https://developer.android.com/studio/run/) - Cách tạo và sử dụng AVD.

💡 Mẹo: Kiểm tra kết nối của thiết bị bằng lệnh adb devices trước khi chạy ứng dụng.
