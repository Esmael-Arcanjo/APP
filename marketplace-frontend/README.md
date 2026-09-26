# LEAMSE Marketplace Frontend

Frontend independente do SaaS. Roda em porta **3001**, usa o mesmo backend em `/api`.

## Rodar em desenvolvimento

```bash
cd /app/marketplace-frontend
yarn install
yarn start
```

Acesse `http://localhost:3001` (ou o preview URL configurado).

## Isolamento

- Cookie próprio (`mp_access_token`) — sessão do SaaS não vaza.
- JWT com `aud=marketplace` — SaaS deps rejeitam automaticamente.
- Coleções: `mp_users`, `mp_products`, `mp_orders`.

## Deploy

Cada frontend pode ser publicado independentemente. Aponte cada domínio para o build correspondente:

- `leamse.com` → `/app/frontend/build`
- `shop.leamse.com` → `/app/marketplace-frontend/build`

O backend é único (compartilhado).
