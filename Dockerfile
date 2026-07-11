# Dockerfile
FROM n8nio/n8n:latest

# Instala o nginx para servir os arquivos estáticos
USER root
RUN apk add --no-cache nginx

# Copia os arquivos do site
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Configura o nginx para servir na porta 8080 (Fly espera essa porta)
RUN echo 'server { \
    listen 8080; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /webhook/ { \
        proxy_pass http://localhost:5678/webhook/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/http.d/default.conf

# Volta para o usuário n8n para segurança
USER node

# Mantém o n8n rodando e o nginx em segundo plano
CMD sh -c "n8n start & nginx -g 'daemon off;'"