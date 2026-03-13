# English Learning Platform — Plano do Projeto

## Visão Geral

Plataforma web para leitura de textos em inglês. O usuário faz upload de um PDF, o sistema extrai o conteúdo e exibe o texto na tela. Ao selecionar qualquer trecho, aparece um pop-up com a tradução em PT-BR e um botão para ouvir o trecho em inglês.

```
Usuário faz upload de PDF
         ↓
Sistema extrai o texto (pdf.js) — roda no browser
         ↓
Texto exibido na tela
         ↓
Usuário seleciona um trecho (mouse ou toque)
         ↓
Pop-up com:
  ├── Tradução PT-BR (LibreTranslate + fallback MyMemory)
  └── Botão "Ouvir" (Web Speech API)
```

---

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **pdfjs-dist** — extração de texto do PDF direto no browser
- **react-dropzone** — upload por clique ou drag-and-drop
- **LibreTranslate** — tradução self-hosted via Docker
- **Web Speech API** — áudio nativo no browser (zero custo, sem backend)
- **next-themes** — alternância claro/escuro persistida

---

## Infraestrutura

### VPS alvo: Linux — 4 GB RAM / 2 vCPU

| Serviço | RAM estimada | CPU |
|---------|-------------|-----|
| Next.js (Node.js) | ~200 MB | baixo |
| LibreTranslate | ~2 GB | médio (somente durante tradução) |
| Nginx (reverse proxy) | ~50 MB | muito baixo |
| **Total** | **~2,3 GB** | ✅ dentro do limite |

### Capacidade simultânea

| Serviço | Limite | Motivo |
|---------|--------|--------|
| Áudio (Web Speech API) | ♾️ ilimitado | roda no browser do usuário |
| Tradução (LibreTranslate) | ~20–30 simultâneos | CPU/RAM da VPS |
| Next.js | ~50–100 simultâneos | depende do tráfego |

---

## Módulos

### 1. Upload e Leitura de PDF ✅
- [x] Área de upload com drag-and-drop (`react-dropzone`)
- [x] Tratamento de MIME type inconsistente no Windows (fallback por extensão `.pdf`)
- [x] Extração de texto multipágina com `pdfjs-dist` (worker via CDN)
- [x] Navegação entre páginas
- [x] Modo de edição por página (corrigir artefatos: títulos colados, drop caps, etc.)
- [x] Auto-save das edições no `localStorage` por nome de arquivo
- [x] Restauração automática das edições ao recarregar o mesmo PDF
- [x] Download do texto completo como `.txt`

### 2. Seleção de Texto + Pop-up ✅
- [x] Detecção de seleção via `mouseup` (desktop) e `touchend` com delay (mobile)
- [x] Pop-up flutuante próximo à seleção (desktop)
- [x] Bottom sheet fixo na parte inferior (mobile/tablet)
- [x] Fechar ao clicar/tocar fora
- [x] Validação: seleção limitada a **1.000 caracteres** (limite da tradução)
- [x] Aviso visual com auto-dismiss (3s) ao ultrapassar o limite

### 3. Tradução (LibreTranslate via Docker) ✅
- [x] API Route `/api/translate` — proxy para LibreTranslate
- [x] Cache em memória (até 5.000 entradas) para evitar chamadas repetidas
- [x] Fallback automático para MyMemory se LibreTranslate estiver offline

**Limites:**
- LibreTranslate self-hosted: sem limite de requisições
- Fallback MyMemory: 500 chars por requisição
- Seleção máxima permitida na UI: 1.000 chars

**Setup do container:**
```bash
docker run -d \
  -p 5000:5000 \
  -e LT_LOAD_ONLY=en,pt \
  libretranslate/libretranslate
```

### 4. Áudio (Web Speech API) ✅
- [x] Botão "Ouvir em inglês" no pop-up
- [x] Seleção explícita de voz `en-US` → `en-GB` → qualquer `en-*`
- [x] Aguarda evento `voiceschanged` se lista de vozes ainda não carregou
- [x] TTS truncado a **500 caracteres** com aviso visual quando texto é maior
- [x] Nota de aviso no pop-up quando truncamento ocorre

**Limites:**
- Limite seguro para TTS: 500 chars (alinhado com fallback MyMemory)
- Limite técnico dos browsers: ~32.767 chars (Chrome/Edge/Safari)

### 5. Personalização Visual ✅
- [x] Alternância modo claro / escuro (`next-themes`, padrão: claro)
- [x] Painel de cores customizadas (ícone 🎨 na barra)
- [x] 6 presets prontos: Padrão, Sépia, Verde suave, Azul suave, Cinza escuro, Preto
- [x] Color pickers para cor de fundo e cor da letra
- [x] Prévia em tempo real no painel
- [x] Cores persistidas no `localStorage`
- [x] Botão "Restaurar" para voltar ao padrão

### 6. Experiência de Leitura ✅
- [x] Layout responsivo para desktop, tablet e celular
- [x] Fullscreen com botão na barra (Esc também funciona)
- [x] Fonte serif para leitura confortável
- [x] Aviso de hidratação suprimido (`suppressHydrationWarning`) para extensões do browser

### 7. Deploy (Docker) 🔲
- [ ] `docker-compose.yml` com Next.js + LibreTranslate + Nginx
- [ ] Nginx como reverse proxy com SSL
- [ ] Let's Encrypt para HTTPS
- [ ] CI/CD com GitHub Actions

---

## Status Geral

| Módulo | Status |
|--------|--------|
| Upload de PDF | ✅ Implementado |
| Extração de texto (pdfjs-dist) | ✅ Implementado |
| Seleção + Pop-up | ✅ Implementado |
| Tradução (LibreTranslate + fallback) | ✅ Implementado |
| Áudio (Web Speech API) | ✅ Implementado |
| Edição de texto por página | ✅ Implementado |
| Auto-save + restauração | ✅ Implementado |
| Download .txt | ✅ Implementado |
| Modo claro/escuro | ✅ Implementado |
| Cores customizadas | ✅ Implementado |
| Fullscreen | ✅ Implementado |
| Responsivo (mobile/tablet) | ✅ Implementado |
| Validação de limites de caracteres | ✅ Implementado |
| Deploy (Docker) | 🔲 Pendente |

---

## Próximos Passos

1. Finalizar `docker-compose.yml` para produção
2. Configurar Nginx + SSL (Let's Encrypt)
3. Deploy na VPS Linux (4 GB RAM / 2 vCPU)
4. Configurar `LIBRETRANSLATE_URL` no `.env` de produção

---

## Comandos Úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Subir LibreTranslate com Docker (apenas en + pt, mais leve)
docker run -d \
  -p 5000:5000 \
  -e LT_LOAD_ONLY=en,pt \
  libretranslate/libretranslate

# Subir todos os serviços (produção)
docker-compose up -d
```


## Visão Geral

Plataforma web para leitura de textos em inglês. O usuário faz upload de um PDF, o sistema extrai o conteúdo e exibe o texto na tela. Ao selecionar qualquer trecho, aparece um pop-up com a tradução em PT-BR e um botão para ouvir o trecho em inglês.

```
Usuário faz upload de PDF
         ↓
Sistema extrai o texto (pdf.js)
         ↓
Texto exibido na tela
         ↓
Usuário seleciona um trecho
         ↓
Pop-up com:
  ├── Tradução PT-BR (LibreTranslate)
  └── Botão "Ouvir" (Web Speech API)
```

---

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **pdf.js** — extração de texto do PDF no browser
- **LibreTranslate** — tradução self-hosted via Docker
- **Web Speech API** — áudio nativo no browser (zero custo)

---

## Módulos

### 1. Upload e Leitura de PDF
- [ ] Área de upload de arquivo PDF (`react-dropzone`)
- [ ] Extração do texto usando `pdf.js` (roda no browser, sem backend)
- [ ] Exibição do texto na tela preservando parágrafos
- [ ] Suporte a PDFs multipágina

### 2. Seleção de Texto + Pop-up
- [ ] Detectar texto selecionado pelo usuário (`window.getSelection()`)
- [ ] Exibir pop-up próximo à seleção com:
  - Trecho selecionado em inglês
  - Tradução em PT-BR
  - Botão "Ouvir" para áudio do trecho
- [ ] Fechar pop-up ao clicar fora

### 3. Tradução (LibreTranslate via Docker)

> **Como funciona:** O LibreTranslate é um serviço de tradução open source que roda localmente em um container Docker. Sem dependência de APIs externas pagas, sem limites de uso e com total privacidade. A aplicação faz requisições HTTP para o container e recebe a tradução em tempo real.

```
[Browser] → [Next.js /api/translate] → [LibreTranslate :5000] → tradução
```

**Setup do container:**
```bash
# Sobe o LibreTranslate carregando apenas inglês e português (mais leve)
docker run -d \
  -p 5000:5000 \
  -e LT_LOAD_ONLY=en,pt \
  libretranslate/libretranslate
```

**Vantagens do self-hosted:**
- ✅ Gratuito, sem limites de requisições
- ✅ Privado (dados não saem do servidor)
- ✅ Sem necessidade de chave de API

**Tarefas:**
- [ ] API Route `/api/translate` (proxy para LibreTranslate)
- [ ] Cache de traduções em memória (evitar chamadas repetidas)
- [ ] Fallback para MyMemory se LibreTranslate estiver offline
- [ ] Configurar `LIBRETRANSLATE_URL` no `.env`

### 4. Áudio (Web Speech API)

> **Como funciona:** API nativa do browser — não precisa de backend, sem custo, funciona em Chrome e Edge. Para trechos curtos (seleções de texto), funciona muito bem.

```javascript
const utterance = new SpeechSynthesisUtterance(trechoSelecionado);
utterance.lang = "en-US";
utterance.rate = 0.9; // ligeiramente mais devagar para aprendizado
window.speechSynthesis.speak(utterance);
```

**Limitações conhecidas:**
- Voz robótica (qualidade inferior ao Google TTS)
- Suporte limitado no Safari
- Depende das vozes instaladas no SO do usuário

**Tarefas:**
- [ ] Botão "Ouvir" no pop-up que lê o trecho selecionado
- [ ] Controle de velocidade (normal / devagar)
- [ ] (Futuro) Substituir por Google Cloud TTS para voz mais natural

### 5. Deploy (Docker)
- [ ] Container: Next.js app
- [ ] Container: LibreTranslate
- [ ] Container: Nginx (reverse proxy + SSL)

---

## Status

| Módulo | Status |
|--------|--------|
| Upload de PDF | 🔲 Pendente |
| Extração de texto (pdf.js) | 🔲 Pendente |
| Seleção de texto + Pop-up | 🔲 Pendente |
| Tradução (LibreTranslate) | 🔲 Pendente |
| Áudio (Web Speech API) | 🔲 Pendente |
| Deploy (Docker) | 🔲 Pendente |

---

## Próximos Passos

1. Instalar dependências: `react-dropzone` e `pdfjs-dist`
2. Criar página de upload de PDF
3. Implementar extração de texto com `pdf.js`
4. Implementar detecção de seleção + pop-up
5. Integrar tradução via LibreTranslate
6. Adicionar áudio com Web Speech API
7. Subir LibreTranslate com Docker

---

## Comandos Úteis

```bash
# Instalar dependências
npm install react-dropzone pdfjs-dist

# Rodar em desenvolvimento
npm run dev

# Subir LibreTranslate com Docker
docker run -d \
  -p 5000:5000 \
  -e LT_LOAD_ONLY=en,pt \
  libretranslate/libretranslate

# Build para produção
npm run build
```