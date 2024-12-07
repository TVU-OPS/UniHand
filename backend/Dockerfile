# Sử dụng image node.js chính thức
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY . .

# Cài đặt dependencies
RUN npm install

#Thiết lập biến môi trường
ENV NODE_ENV=production  
ENV HOST=0.0.0.0
ENV PORT=1337
ENV APP_KEYS=bVs5EgZP1qUcGFJiNkE7tQ==,G8Q49epA4c7E72qeNj3bSw==,wEyukdo3EeIwm/6aqPUpEg==,Pv4bZ1G18aHTQxBbMXaaow==
ENV TRANSFER_TOKEN_SALT=w0Qe64MfmIDf98flEwNNnQ==
ENV DATABASE_CLIENT=mysql
ENV DATABASE_SSL=false

# Expose cổng mà ứng dụng Strapi chạy
EXPOSE 1337

RUN npm run build:pro
