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

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Railway (and many platforms) expect the container to listen on $PORT.
# Most nginx configs default to `listen 80;` so we rewrite it at runtime.
# If PORT isn't set, we fall back to 80 for local runs.
EXPOSE 80

CMD ["sh", "-c", "sed -i -E 's/listen[[:space:]]+80;/listen '${PORT:-80}';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
