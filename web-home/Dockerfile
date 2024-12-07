FROM nginx:alpine

# Sao chép build của ReactJS từ bước 1 vào nginx
COPY ./build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cung cấp cổng 80 để truy cập ứng dụng
EXPOSE 80

# Khởi động nginx khi container chạy
CMD ["nginx", "-g", "daemon off;"]