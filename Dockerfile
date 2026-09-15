# Static web server for the planet map. Runs as a non-root user on port 9080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY index.html main.js climate.js geography.js style.css /usr/share/nginx/html/
COPY data/elevation.json data/elevation.bin /usr/share/nginx/html/data/

# The base image listens on 8080, which is often taken; fail the build if the line ever changes.
RUN sed -i 's/listen[[:space:]]*8080;/listen 9080;/' /etc/nginx/conf.d/default.conf \
  && grep -q 'listen 9080;' /etc/nginx/conf.d/default.conf

EXPOSE 9080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:9080/ || exit 1
