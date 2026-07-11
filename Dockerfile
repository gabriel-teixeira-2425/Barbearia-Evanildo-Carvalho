FROM n8nio/n8n:latest

# Define a porta que o n8n vai usar
ENV N8N_PORT=5678

# Expõe a porta
EXPOSE 5678

# Inicia o n8n
CMD ["n8n", "start"]