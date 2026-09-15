# Static web server for the planet map. Runs as a non-root user on port 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY index.html main.js climate.js geography.js style.css /usr/share/nginx/html/
COPY data/elevation.json data/elevation.bin /usr/share/nginx/html/data/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
