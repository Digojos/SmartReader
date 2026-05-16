# Coloque aqui os certificados SSL após configurar o Let's Encrypt:
#   fullchain.pem
#   privkey.pem
#
# Comando para gerar com certbot (na VPS):
#   certbot certonly --standalone -d seu-dominio.com
#   cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem ./nginx/certs/
#   cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem ./nginx/certs/
#
# Se o certificado for gerado por um stack Docker separado (ex.: portal-apps.com.br),
# o Nginx que faz o proxy precisa enxergar os arquivos em /etc/letsencrypt/live/<dominio>/
# ou receber um mount/sincronização equivalente antes do reload.
