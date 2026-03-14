# Os certificados SSL são montados diretamente do host via Docker volume.
# O container Apache acessa: /etc/letsencrypt (somente leitura)
#
# Para gerar os certificados no host da VPS:
#   certbot certonly --standalone -d english.forestcode.vps-kinghost.net
#
# Ou usando o método webroot (com o container Apache rodando):
#   certbot certonly --webroot -w /var/www/certbot -d english.forestcode.vps-kinghost.net
#
# Os caminhos esperados pelo Apache:
#   /etc/letsencrypt/live/english.forestcode.vps-kinghost.net/fullchain.pem
#   /etc/letsencrypt/live/english.forestcode.vps-kinghost.net/privkey.pem
