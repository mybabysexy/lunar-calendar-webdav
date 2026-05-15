# Sử dụng image Node.js phiên bản Alpine (rất nhẹ, tối ưu cho production)
FROM node:20-alpine

# Khai báo môi trường là production
ENV NODE_ENV=production

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy các file quản lý thư viện vào trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt thư viện (chỉ cài dependencies, bỏ qua devDependencies)
RUN npm ci --only=production

# Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# Mở port mà app sẽ chạy
EXPOSE 3000

# Kiểm tra sức khỏe container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Lệnh khởi động app
CMD ["npm", "start"]