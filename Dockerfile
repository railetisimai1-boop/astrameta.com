# astra-meta statik sitesi — Coolify / Docker
# Coolify bu Dockerfile'ı görür, nginx ile statik dosyaları 80 portunda yayınlar.
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
