# frontend/Dockerfile
FROM nginx:alpine

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend files
COPY frontend/ /usr/share/nginx/html/

EXPOSE 80