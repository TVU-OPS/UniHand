const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dotenvPath = path.join(__dirname, ".env"); // Đường dẫn tới file .env

// Các biến môi trường cần tạo
const envs = [
  {
    API_TOKEN_SALT: crypto.randomBytes(12).toString("hex"),
    ADMIN_JWT_SECRET: crypto.randomBytes(32).toString("hex"),
    JWT_SECRET: crypto.randomBytes(32).toString("hex"),
  },
  {
    DATABASE_NAME: "your_unihand_db",
    DATABASE_USERNAME: "your_unihand_user",
    DATABASE_PASSWORD: "your_user_password",
  },
  {
    EMAIL_USER: "",
    EMAIL_PASS: "",
  },
  {
    HOME_DOMAIN: "localhost",
    ADMIN_DOMAIN: "admin.localhost",
  },
];

// Kiểm tra file .env có tồn tại không
if (!fs.existsSync(dotenvPath)) {
  fs.writeFileSync(dotenvPath, "", "utf8");
  console.log("Đã tạo file .env");
}

const envContent = fs.readFileSync(dotenvPath, "utf8");
let updatedContent = envContent;
envs.forEach((env) => {
  Object.keys(env).forEach((key) => {
    if (!envContent.includes(`${key}=`)) {
      updatedContent += `\n${key}=${env[key]}`;
      console.log(`Đã thêm ${key} vào file .env`);
    } else {
      console.log(`${key} đã tồn tại`);
    }
  });
  updatedContent += "\n";
});
fs.writeFileSync(dotenvPath, updatedContent.trim(), "utf8");
console.log("Mở file .env để xem chi tiết");
