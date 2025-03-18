# Sử dụng Nginx làm server
FROM nginx:alpine

# Sao chép các file vào thư mục của Nginx
COPY . /usr/share/nginx/html

# Mở cổng 80
EXPOSE 80