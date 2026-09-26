# Configurar wibaza.com como domínio do Marketplace

Você já tem o domínio `www.wibaza.com`. Para publicá-lo apontando para este marketplace:

## 1. Build de produção do marketplace

```bash
cd /app/marketplace-frontend
yarn build
```

O build sai em `/app/marketplace-frontend/build/`.

## 2. Editar `.env` do marketplace

```
REACT_APP_BACKEND_URL=https://api.wibaza.com
```

(ou continue usando `https://biolinks-pro-3.preview.emergentagent.com` se quiser manter o mesmo backend enquanto testa)

## 3. Hospedar o build

Dois caminhos populares:

- **Vercel / Netlify / Cloudflare Pages**: aponte o repositório de `marketplace-frontend/` e no painel do provedor cadastre o domínio `www.wibaza.com` com o CNAME que ele indicar.
- **Nginx próprio**: sirva `build/` como estático com fallback `try_files $uri /index.html;` e cadastre um certificado Let's Encrypt para `www.wibaza.com`.

## 4. DNS

No painel do seu registrador (onde comprou o wibaza.com):

- `A` (ou `CNAME`) `www.wibaza.com` → IP/host do provedor de hospedagem.
- Redirecionar `wibaza.com` (root) para `www.wibaza.com`.

## 5. Backend

O backend já aceita qualquer origem (`allow_origin_regex=".*"` com `allow_credentials=True`), então cookies de sessão do marketplace vão funcionar em qualquer domínio. Se quiser trancar produção depois, restrinja o regex a `^https://(www\.)?wibaza\.com$`.

## 6. SaaS continua separado

O SaaS admin continua em `/app/frontend/` — publique-o em outro domínio (ex: `leamse.com`) sem interferir com o marketplace. Cada um pode ser deployado, atualizado ou desligado sem afetar o outro.
