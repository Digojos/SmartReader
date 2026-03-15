# Deploy — English App

Guia para atualizar o código fonte em produção na VPS Linux.

---

## Pré-requisitos

- Acesso SSH à VPS
- Docker e Docker Compose instalados
- Repositório clonado em `/var/www/english` (ou caminho equivalente)
- Arquivo `.env` configurado no diretório do projeto

---

## Atualizar o código e redeploy

```bash
# 1. Acesse o diretório do projeto na VPS
cd /root/SmartReader

# 2. Baixe as atualizações do repositório
git pull origin main

# 3. Rebuild da imagem da aplicação (sem cache para garantir que o novo código seja usado)
docker compose build --no-cache app

# 4. Recrie e suba o container da aplicação
docker compose up -d --force-recreate app
```

> O LibreTranslate **não precisa** ser reiniciado a menos que sua configuração tenha mudado.

---

## Verificar se está rodando

```bash
# Ver status dos containers
docker compose ps

# Acompanhar logs em tempo real
docker compose logs -f app
```

---

## Se houver migrações de banco de dados (Prisma)

Caso o deploy inclua alterações no `prisma/schema.prisma`, rode a migration antes de subir o container:

```bash
# Rodar migrations dentro do container em execução
docker compose exec app npx prisma migrate deploy
```

Ou, se o container ainda não estiver rodando, execute diretamente:

```bash
docker compose run --rm app npx prisma migrate deploy
```

---

## Rollback rápido

Se precisar voltar para a versão anterior:

```bash
# Volte para o commit anterior
git checkout <hash-do-commit>

# Rebuild e recrie o container
docker compose build --no-cache app
docker compose up -d --force-recreate app
```

---

## Variáveis de ambiente (.env)

O arquivo `.env` **não é versionado** e deve estar presente na raiz do projeto na VPS. Variáveis necessárias:

```env
DATABASE_URL=mysql://usuario:senha@host:3306/nome_do_banco
NEXTAUTH_SECRET=seu_secret_seguro
NEXTAUTH_URL=https://english.forestcode.vps-kinghost.net
```

> `LIBRETRANSLATE_URL` e `LIBRETRANSLATE_API_KEY` já estão definidas diretamente no `docker-compose.yml`.

---

## Rede Docker

A rede `shared_network` é **externa** e deve existir antes de subir os containers. Caso não exista:

```bash
docker network create shared_network
```
