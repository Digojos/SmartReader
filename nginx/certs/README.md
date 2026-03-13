# Coloque aqui os certificados SSL após configurar o Let's Encrypt:
#   fullchain.pem
#   privkey.pem
#
# Comando para gerar com certbot (na VPS):
#   certbot certonly --standalone -d seu-dominio.com
#   cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ./nginx/certs/
#   cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ./nginx/certs/
