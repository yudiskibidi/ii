FROM node:18-alpine     # Base image Node.js versi 18
WORKDIR /app            # Set working directory di container
COPY package*.json ./   # Salin package.json dan package-lock.json
RUN npm install         # Install dependencies
COPY . .                # Salin semua file project
EXPOSE 3000             # Expose port 3000
CMD ["node", "server.js"] # Perintah untuk menjalankan aplikasi