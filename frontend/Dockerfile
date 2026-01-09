FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build argument for API URL (set in Railway)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config template with PORT placeholder
RUN echo 'server { \
    listen PORT_PLACEHOLDER; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Replace PORT_PLACEHOLDER with actual PORT at runtime (with debug output)
CMD ["sh", "-c", "echo '=== Railway PORT: '${PORT:-80}' ===' && sed -i \"s/PORT_PLACEHOLDER/${PORT:-80}/g\" /etc/nginx/conf.d/default.conf && echo '=== Final nginx config ===' && cat /etc/nginx/conf.d/default.conf && echo '=== Starting nginx ===' && nginx -g 'daemon off;'"]