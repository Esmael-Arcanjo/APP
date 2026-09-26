# LEAMSE — Financial & Commerce Infrastructure

## Problem statement
SaaS internacional (concorrente de Stripe/Resend). Cinco serviços, cada um com seu próprio painel isolado. Usuário escolhe UM serviço no cadastro (não pode trocar depois). Preços diferentes por serviço. Admin controla usuários, planos e preços.

## Serviços e cobrança
- **LEAMSE Payments** — Pay-as-you-go
- **Marketplace API** — Pay-as-you-go
- **Email API** — US$ 25/mês · US$ 250/ano
- **Automação** — R$ 30/mês · R$ 350/ano (sem API/chaves)
- **Link na Bio** — R$ 5/mês · R$ 50/ano (sem API/chaves)

## Feito (Fev/2026)
- Fluxo de cadastro em 3 passos: escolher serviço (bloqueado) → conta → pagamento
- Moeda auto-detectada por IP (`/api/public/geo` via ipapi.co)
- Auth JWT (email+senha, bcrypt, cookies httpOnly), admin seedado com `suportwibaza@hotmail.com` / `LeamseAdmin2026!`
- Stripe Checkout para planos com assinatura (email/automação/linkbio) — sandbox provisionado
- Painel `/app/admin`: usuários (banir/desbanir/excluir/liberar plano grátis com dias), stats, edição de preços por serviço
- Sidebar: link "Admin" só para role=admin; nav sem API/Chaves em Automação e Link na Bio

## Backlog priorizado
- Cobrança recurring real (assinatura Stripe) — hoje é one-time checkout
- Webhooks reais para eventos de billing
- Página de gerenciamento de plano para o usuário final (upgrade/cancelar)
- Emails transacionais (confirmação de cadastro, pagamento)

## Update (Fev/2026 v2) — Recurring + Plan Management + Trial + Emails
- Stripe Checkout agora usa `mode="subscription"` com recurring `price_data` (renova mensal/anual automaticamente)
- Trial gratuito de 7 dias em toda nova assinatura (`subscription_data.trial_period_days=7`)
- Painel de plano em `/app/settings`: ver plano ativo, trocar mensal↔anual, cancelar (cancel_at_period_end no Stripe)
- Endpoints: `GET /billing/subscription`, `POST /billing/subscription/change-interval`, `POST /billing/subscription/cancel`
- Webhook agora processa `invoice.paid`, `invoice.payment_succeeded`, `customer.subscription.deleted`
- Emails de boas-vindas (após cadastro) e de confirmação (após pagamento) registrados em `email_logs` (LEAMSE Email API — o próprio produto envia)

## Update (Fev/2026 v3) — Real emails + Proration + Coupons + Trial reminder
- **LEAMSE Email API entrega real**: `send_internal()` usa Emergent Email proxy (EMERGENT_EMAIL_KEY) com guardrails G2/G3; templates server-side: `welcome`, `payment_success`, `trial_ending`. Testado com `delivered@resend.dev` (status=sent, provider_id retornado)
- **Proração ao trocar plano**: `POST /billing/subscription/change-interval` chama `stripe.Subscription.modify` com `proration_behavior="create_prorations"` — Stripe credita valor não utilizado ao mudar entre mensal/anual
- **Cupons**: modelo `coupons` + Stripe Coupon + PromotionCode (polymorphic v14+). Admin CRUD em `/api/admin/coupons`. Público valida via `/api/public/coupons/{code}`. Aceito no checkout via `discounts=[{promotion_code:...}]`. UI: aba "Cupons" no admin + campo de cupom no step 3 do cadastro
- **Aviso de fim de trial**: `.emergent/crons.yml` roda diariamente às 10 UTC. Endpoint `/api/cron/trial-ending` autentica com `WEBHOOK_CRON_SECRET`, ack 2xx imediato, background scan das subs com trial acabando em 2-3 dias, envia email `trial_ending` (idempotente via `trial_reminder_sent`)

## Update (Fev/2026 v4) — Pricing landing + Admin metrics + Segmented coupons + Card recovery + LinkBio hidden
- **Página de preços pública**: seção `#pricing` na Landing com preços em tempo real (fetched from `/api/public/pricing`) para todos os 5 serviços com CTA por card
- **Painel de métricas**: nova aba "Métricas" no admin — cards de trials/conversão + gráfico de linha da receita últimos 12 meses (recharts LineChart) + gráfico de barras de novos planos por mês + planos ativos por serviço. Endpoint `/api/admin/metrics/timeseries`
- **Cupons segmentados**: campos `service` (any/payments/marketplace/email/automation/linkbio) e `min_interval` (any/yearly). Validação aplicada em `/api/public/coupons/{code}` e no `/api/billing/checkout`. UI: dois selects extras no form de criação + coluna "Escopo" na tabela
- **Recuperação de cartão**: webhook `invoice.payment_failed` dispara email `card_recovery` com CTA para atualizar cartão em Configurações
- **LinkBio removido do header/rodapé do sidebar**: agora aparece apenas quando é o serviço escolhido pelo usuário (mesma regra dos outros serviços)

## Update (Fev/2026 v5) — Marketplace Frontend Independente
- **/app/marketplace-frontend/** (CRA + CRACO, porta 3001) — 100% isolado do SaaS
- Backend novo: `/app/backend/app/modules/marketplace_public/` com endpoints `/api/mp/auth/{register,login,me,logout}`, `/api/mp/seller/{products,orders}`, `/api/mp/my/orders`, `/api/shop/{products,products/{id},categories,orders}`
- **Isolamento total**:
  - Cookie separado (`mp_access_token`) — sessões SaaS e Marketplace nunca colidem
  - JWT com `aud="marketplace"` — SaaS deps rejeitam com 401 (validado)
  - SaaS token contra `/api/mp/*` retorna 401 (validado)
  - Coleções isoladas: `mp_users`, `mp_products`, `mp_orders`
- **Páginas do marketplace**: Home (hero + destaques + categorias), Shop (grid + busca + filtro categoria), ProductDetail (galeria + qty + comprar/carrinho), Cart (persistente via zustand localStorage), Checkout (endereço/telefone), Login, Register (buyer/seller com toggle), MyOrders (histórico do comprador), SellerDashboard (aba produtos com CRUD + aba pedidos com update de status)
- Marketplace-frontend roda com `bash /app/marketplace-frontend/start.sh` na porta 3001. Cada frontend pode ser buildado e deployado independentemente (`shop.leamse.com` × `leamse.com`)

## Update (Fev/2026 v6) — Payments no Shop + Store pública + Reviews + wibaza.com
- **Pagamento LEAMSE Payments no Shop**: `/api/shop/checkout` cria Stripe session (mode=payment). Ordens nascem em `awaiting_payment` e viram `pending` (fila do vendedor) somente após `/api/shop/checkout/status/{sid}` confirmar pago. Estoque só é debitado quando o pagamento aprova. Retorno em `/order/success` (polling) e `/order/cancel`
- **Página pública do vendedor** `/store/:slug`: banner customizável + bio + stats (produtos, pedidos concluídos, tempo de loja) + grid de produtos. Slug gerado automaticamente no registro e único (dedup com sufixo `-2, -3, ...`). Backfill aplicado nos vendedores existentes
- **Endpoint público** `GET /api/shop/store/:slug` retorna seller + products + stats
- **Novo endpoint** `PATCH /api/mp/seller/profile` para editar `store_name`, `banner_url`, `bio`
- **Reviews de produto**: `POST /api/shop/products/:id/reviews` (rating 1-5 + comentário) só aceita compradores que tenham pelo menos 1 pedido entregue com aquele produto. Anti-duplicata (índice único buyer+product). `GET /api/shop/products/:id` retorna `reviews_summary: {avg, count}`. Página do produto mostra estrelas, resumo e lista de reviews; formulário aparece só para compradores elegíveis
- **wibaza.com**: guia completo em `/app/marketplace-frontend/DEPLOY_WIBAZA.md` (build → hospedagem → DNS → CORS). Backend com `allow_origin_regex=".*"` já aceita o novo domínio; recomenda-se restringir depois a `^https://(www\.)?wibaza\.com$`

## Update (Fev/2026 v7) — Marketplace Admin Dashboard + Chat comprador↔vendedor
- **Painel Admin do Marketplace** (isolado do admin SaaS): rotas `/admin/*` no marketplace-frontend com tema dark próprio. Login em `/admin/login` valida `user_type=admin` no `mp_users`. Seed idempotente em startup (`seed_mp_admin`) cria `admin@wibaza.com` / `WibazaAdmin2026!`.
  - `GET /api/mp/admin/stats` — cards de vendedores/compradores/produtos/pedidos/receita/tíquete médio
  - `GET /api/mp/admin/users` (filtro `user_type`, `banned`) + `POST /api/mp/admin/users/:id/ban` (banned:bool) + `DELETE /api/mp/admin/users/:id` (banir seller oculta todos os produtos dele)
  - `GET /api/mp/admin/products` (filtro `active`, `search`) + `PATCH /api/mp/admin/products/:id` (toggle active) + `DELETE`
  - `GET /api/mp/admin/orders` (filtro `status`)
  - **Regra**: novos produtos são visíveis por padrão; admin modera desativando (`c2` do último ask)
- **Chat comprador↔vendedor** (REST + polling 2.5s):
  - Coleções: `mp_chat_threads` (buyer_id+seller_id único, product snapshot opcional, unread_buyer/unread_seller) e `mp_chat_messages` (thread_id, sender_role, text)
  - `POST /api/mp/chat/start` (buyer only) reusa thread por par buyer+seller
  - `GET /api/mp/chat/threads` (buyer OU seller) + `GET /api/mp/chat/threads/:id/messages?after=ISO` (poll) + `POST /messages`
  - **UI**: `ChatDrawer` (slide-in direito), botão "Falar com vendedor" na ProductDetail (com snapshot do produto) e "Falar com a loja" na SellerStore, tab "Mensagens" no header (buyer & seller) → página `/messages` com inbox + drawer
  - Badge de mensagens não lidas por thread; leitura zera contador do lado que abriu
- **Login**: agora rejeita `banned=true` com 403 "Conta suspensa"
## Update (Fev/2026 v10) — Marketplace Wibaza: refatoração completa
- **Rebranding**: Header agora é "Wibaza" (wordmark, sem logo). Removido LEAMSE do marketplace.
- **Home**: hero focado, chips de categoria stick abaixo do header (8 categorias), grid de cards 4-col em desktop com 30 produtos reais seedados. Cada card mostra badge de categoria, imagem, nome, vendedor e preço destacado.
- **30 produtos seedados** (`seed_products.py` idempotente) em 8 categorias (Moda F/M, Casa & Decoração, Eletrônicos, Beleza, Esportes, Livros, Alimentos), cada um com:
  - 10 fotos únicas via picsum
  - Descrição detalhada
  - Tamanhos e cores por categoria
  - Vendedor demo: `demo.seller@wibaza.com` / `DemoSeller2026!` — loja "Wibaza Store"
- **ProductDetail**: galeria de 10 fotos (thumbs 5x2 clicáveis), seletor de tamanho, seletor de cor, descrição destacada, validação obrigatória de tamanho/cor antes de adicionar ao carrinho.
- **Cart**: item mostra categoria (badge laranja), nome, vendedor, chips "Tam: X" / "Cor: Y" e preço. Loja Zustand agora indexa por variante `product|size|color` — mesma peça em tamanhos diferentes viram linhas separadas.
- **Checkout backend**: `ShopCheckoutItem` aceita `size` e `color`; `mp_orders.items` persiste `category`, `size`, `color`, `seller_name` (aparece no painel do vendedor).
- **Dashboards com sidebar** (todos em pastas separadas, código isolado):
  - `/buyer/*` — `BuyerLayout` (sidebar hover-expand + indicador de ativo) com Visão geral, Meus pedidos, Mensagens, Perfil
  - `/seller/*` — `SellerLayout` idem com Visão geral, Produtos, Pedidos, Mensagens, Perfil da loja + botão "Ver loja pública"
  - `/admin/*` — já existia (isolado)
- **Perfil de comprador**: novo endpoint `PATCH /api/mp/auth/me` (name, phone, shipping_address) + página com formulário.
- **Perfil de vendedor**: página `/seller/profile` usando o `PATCH /api/mp/seller/profile` existente (store_name, bio, banner_url).
- **SellerProducts**: form suporta até 10 URLs de foto (adicionar/remover), tamanhos e cores em CSV; produto novo herda a primeira foto como `image_url`.
- **Cadastro comprador/vendedor**: já em arquivos separados (`RegisterBuyer.jsx`, `RegisterSeller.jsx`) — mantido.
- **Integrações preparadas** (chaves vazias no `/app/backend/.env`, prontas para preencher depois): `RESEND_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_PRESET`. Stripe já configurado.
- **Painel do Admin em shell próprio** (`/app/admin/*`): não usa `DashboardLayout` nem o service switcher. Sidebar próprio com Visão geral / Usuários / Preços / Cupons / Métricas. Ao logar como admin, `DashboardLayout` redireciona automaticamente para `/app/admin`
- **`Admin.jsx` monolítico dividido** em 6 arquivos: `pages/admin/AdminLayout.jsx`, `AdminOverview.jsx`, `AdminUsers.jsx`, `AdminPricing.jsx`, `AdminCoupons.jsx`, `AdminMetrics.jsx`
- **Migração do admin**: `seed_admin` agora limpa `services=[]`, `locked_service=None`, `payment_pending=False` e apaga api_keys da organização admin. Admin não tem serviço nem plano
- **Sidebar hover-expand**: colapsado por padrão (w-16, só ícones), expande ao passar o mouse (w-64). Aplicado tanto no shell de serviços quanto no shell admin
- **Topbar**: removido service switcher; substituído por "pill" com avatar + nome + empresa do usuário logado (dropdown com perfil e logout)
- **API Keys**: adicionado botão **Apagar** (`DELETE /api/api-keys/:id`) ao lado de Rotacionar/Revogar, para excluir chaves definitivamente
- **Object Storage integrado**: novo módulo `app/modules/storage/{service,routes}.py` usando Emergent Object Storage. Endpoints:
  - `POST /api/storage/upload` — recebe multipart, retorna `{id, url}` (persistido em `db.files`)
  - `GET /api/storage/files/{id}` — download público com Cache-Control immutable
  - Componente reutilizável `ImageUpload.jsx` (drag&drop leve, preview, remover)
- **Link na Bio redesign**: campo `cover_url` novo no schema + preview reformulado (moldura de celular, capa 40/60 com gradiente, foto de perfil com sombra, links com ícone dinâmico por domínio — Instagram/YouTube/TikTok/Spotify/WhatsApp — cartões com hover lift, botão WhatsApp destacado com shadow colorido)
- Testes: admin migration OK (services=[], locked_service=None), upload real gera `{id,url}`, dashboard admin renderiza (screenshot), sidebar colapsa/expande no hover
- **Branding "LEAMSE Payments" removido do shop**: checkout do marketplace continua usando `stripe.checkout.Session.create(mode="payment")` (mesma implementação); UI agora diz "Pagamento seguro via Stripe" e botão "Pagar com Stripe" em `Checkout.jsx`
- **Registro dividido em 3 páginas**:
  - `/register` — página de escolha com dois cards (comprador × vendedor)
  - `/register/buyer` — form dedicado com dados mínimos (nome, e-mail, tel, senha)
  - `/register/seller` — form dedicado com "Nome da loja" em destaque + aside listando benefícios (URL própria, painel, chat, Stripe)
  - CTA "Quero vender" da Home aponta direto para `/register/seller`
- Backend `POST /api/mp/auth/register` inalterado — os dois forms enviam `user_type` correspondente
