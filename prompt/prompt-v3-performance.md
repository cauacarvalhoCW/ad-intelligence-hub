Você é um(a) engenheiro(a) frontend sênior. Entregue uma implementação clean, acessível e performática para um novo módulo de Performance. Não reutilize componentes/estilos existentes; crie tudo do zero. Use shadcn/ui (Cards, Tabs, Button, DropdownMenu, Dialog/Sheet, Input, Select, Badge, Skeleton, ScrollArea, Data Table com TanStack Table) e os exemplos de Charts do shadcn (Recharts estilizado com shadcn/ui) para todos os gráficos.
As páginas de Concorrentes já existem e não devem ser alteradas, apenas ganhar um link no header para alternar Performance ↔ Concorrentes.

0) Contexto e restrições

Rotas (perspectivas): default | cloudwalk | infinitepay | jim.

default = mesmos dados de cloudwalk; muda só o tema/CSS.

cloudwalk: produtos POS | TAP | LINK | JIM.

infinitepay: produtos POS | TAP | LINK.

jim: produto único JIM.

Plataformas: META | GOOGLE | TIKTOK.

Ranges de período: 7d (default) | 30d | alltime.

Views (granularidade): day | week | month | alltime.

DB (apenas para nomes corretos, sem escrever SQL aqui): tabela public.mkt_ads_looker com colunas (destaques):
date, platform, product, campaign_id, campaign_name, ad_id, ad_name, cost, impressions, clicks, video_3s, "tap signup", "tap activations", "tap 5trx", "tap cnpj signups", pos_sales, piselli_sales, install, signup_web, activation_app, activation_web, link_signup, link_activations, creative_link, creative_id, id.
Observação: colunas com espaço precisam de aspas duplas quando usadas em código (ex.: "tap signup"), mas neste prompt não gerar código.

Não reutilizar componentes/estilos/hooks existentes no projeto. Tudo novo.

Aparência: use shadcn/ui; cards com bordas suaves, elevation leve, tipografia clara, estados de hover/active/focus; responsivo; dark mode.

1) Navegação e layout base

Header da perspectiva (componente novo):

Título = nome da perspectiva (ex.: “InfinitePay – Performance”).

Switch de páginas com 2 itens: Performance ↔ Concorrentes.

Ação “Concorrentes” navega para /:perspective/concorrentes.

Ação “Performance” navega para /:perspective/performance.

Tabs de produto:

cloudwalk/default: POS | TAP | LINK | JIM.

infinitepay: POS | TAP | LINK.

jim: somente JIM (mostrar uma tab única, desabilitada para indicar contexto).

No overview: as tabs mudam o contexto dos cards/listas (não trocam rota).

No drilldown de produto: as tabs trocam rota entre /:perspective/performance/[pos|tap|link|jim].

2) Filtros (componente novo, exclusivo do módulo)

Posição: canto superior direito do conteúdo principal (abaixo do header/tabs).

Platform Multi-Select: META, GOOGLE, TIKTOK.

Range Presets: 7d (default), 30d, alltime.

View (granularidade): day, week, month, alltime.

UX: usar DropdownMenu/Select, Badge para tokens de plataformas, e Skeletons durante carregamento.

Sincronizar estado com a URL (querystring) para deep-linking, mas mantenha o componente independente (novo hook).

3) KPIs e definições (usar nomes corretos)

KPI Row (totais do período ativo):
Cost, Impressions, Clicks, Signups, Activations, POS Sales, Piselli Sales, % Piselli, 5ª Transação.

CTR = clicks / impressions.

CPM = cost / impressions * 1000.

Hook Rate = video_3s / impressions.

Signups (overview) = TAP("tap signup" + "tap cnpj signups") + LINK(link_signup) + JIM(signup_web).

Activations (overview) = TAP("tap activations") + LINK(link_activations) + **JIM(activation_app + activation_web)`.

CPA = cost / signups (mostrar “—” se divisor = 0).

CAC = cost / activations (mostrar “—” se divisor = 0).

% Piselli = piselli_sales / pos_sales (mostrar “—” se pos_sales = 0).

5ª Transação = "tap 5trx" (número bruto; hoje atrelado a TAP).

Installs (somente JIM) = install (exibir como campo adicional quando tab/contexto = JIM).

4) Página: Overview da empresa — /:perspective/performance

Ordem dos blocos no body (usar shadcn/ui + Charts do shadcn):

KPI Row (Cards) — conforme seção 3.

Gráfico de Eficiência no Tempo (Linha/Área): toggle entre CAC | CPM | CPA | CTR | Hook Rate; granularidade = view.

Custo por Plataforma (Barras empilhadas): stacks para META | GOOGLE | TIKTOK; eixo X = tempo (de acordo com view).

Custo por Produto (Barras agrupadas): barras para POS | TAP | LINK | JIM; ordenar desc por Cost.

Funil (Funnel): Impressions → Clicks → Signups → Activations com taxas de passagem entre etapas.

Cards “Melhor Ad por Produto”:

1 card por produto da perspectiva atual.

Exibir: thumbnail (imagem/vídeo), CAC, CTR, views 3s (quando houver), Plataforma, e botão “Ver detalhe” que deep-linka para a página existente de detalhe do anúncio em Concorrentes (/:perspective/concorrente/ad/:creativeId).

Tabelas “Criativos mais escalados” por produto:

Uma seção por produto; tabela ordenável por Cost (desc).

Colunas: Ad, Plataforma, Cost, Impressions, Clicks, CTR, Signups, Activations, CPA, CAC, POS Sales, Piselli Sales, % Piselli, 5ª Transação.

Paginação e busca por ad_name.

Ação de linha: abrir detalhe do anúncio (deep-link citado acima).

5) Página: Produto (Drilldown) — /:perspective/performance/[pos|tap|link|jim]

Ordem dos blocos (usar shadcn/ui + Data Table/Charts):

Tabs de produto (navegam entre produtos; a ativa corresponde à rota).

Dois botões/filtros + seletor de view:

Plataforma (Multi-Select).

Range (7d/30d/alltime).

View (Diária/ Semanal/ Mensal/ All time).

Tabela principal (com Views e Modos):

Views: Diária, Semanal, Mensal, All time (controla a granularidade quando relevante).

Modos de agrupamento (3 toggles):

Por Anúncio (1 linha por ad_id no período).

Diarizado (linhas por ad_id × bucket(view); ex.: dia/semana/mês).

Por Campanha (ad_id × campaign_id) — para comparar o mesmo criativo em várias campanhas.

Colunas (mínimo):
Ad, Campanha (no modo ad×campanha), Plataforma, Cost, Impressions, Clicks, CTR, CPM, Signups, Activations, CPA, CAC, Hook Rate, POS Sales, Piselli Sales, % Piselli, 5ª Transação

Quando produto = JIM, exibir coluna Installs.

Recursos: ordenação, paginação, column visibility, column pinning, CSV export.

Custo por Plataforma (do produto) — Barras empilhadas (granularidade = view).

Custo + CAC (do produto) — Barras de Cost com linha de CAC (mesmo eixo X da view).

Evolução de Signups — Linha (e Activations como série opcional).

(Opcional) Top 3 Anúncios do Produto — Cards compactos com ranking por menor CAC, tie-break por maior CTR.

6) Regras de negócio (seleção/ranking)

“Melhor Ad” por produto (overview): escolher o ad com menor CAC no período; desempate por maior CTR; exibir views 3s se houver.

“Mais escalados” por produto: ordenar por Cost desc, limitar a N (ex.: 50 por produto, paginado).

% Piselli: exibir apenas quando pos_sales > 0; senão mostrar “—”.

5ª Transação: número bruto; exibir principalmente em TAP; em outros produtos pode ser “—” se não houver dado.

7) Experiência do usuário

Skeletons para todos os cards, gráficos e tabelas durante carregamento.

Empty states claros (sem dados no período/filtro): ícone, título e chamada para ajustar filtros.

Error states com toast (shadcn/ui useToast) e área de retry inline.

Acessibilidade: foco visível, tamanho de toque adequado, aria-labels em botões de ação, contraste AA/AAA.

Responsividade:

Mobile: pilhar cards, gráfico de linha com brush opcional, tabela com column visibility mínima.

Desktop: grid a 12 colunas; KPIs em 4–5 por linha; gráficos em Cards 6×6; tabelas em largura total.

Dark mode: herdar do tema, garantindo tokens de cor corretos nos gráficos (linhas/áreas/barras).

8) Theming e variações por perspectiva

default vs cloudwalk: usar os mesmos dados e mesmo layout; apenas trocar o tema/CSS (ex.: cores de marca, ícones, ilustrações).

infinitepay e jim: manter o mesmo layout/fluxo; tabs de produto conforme disponibilidade.

9) Instrumentação e QA

Telemetry: eventos para mudanças de filters, view, range, clique em “ver detalhe”, exportações de tabela.

Testes de aceitação (visuais/funcionais):

Troca de plataforma/range/view reflete em todos os gráficos e tabelas.

Tabs do overview não mudam rota; tabs do drilldown mudam rota.

Header alterna corretamente Performance ↔ Concorrentes preservando a perspectiva.

KPIs batem com o período e filtros; % Piselli e Installs (JIM) mostram quando apropriado.

Ordenações e paginação da Data Table estáveis; CSV export contempla column visibility.

10) Entregáveis (sem código aqui, apenas especifique)

Páginas:

/:perspective/performance (overview).

/:perspective/performance/[pos|tap|link|jim] (produto).

Componentes (todos novos, shadcn/ui):

HeaderSwitch (Performance ↔ Concorrentes)

ProductTabs

PerfFilters

KpiRow

EfficiencyChart

CostByPlatformChart

CostByProductChart

FunnelChart

BestAdCard (lista por produto)

MostScaledTable (lista por produto)

ProductTable (modos: ad, diarizado, ad×campanha)

ProductCostByPlatformChart

ProductCostAndCACChart

ProductSignupsChart

EmptyState, ErrorState, LoadingSkeletons

Dica final: para os gráficos, use os exemplos de Charts do shadcn (Recharts), embrulhados em <Card>/<CardHeader>/<CardContent>; para tabelas, use o Data Table do shadcn (TanStack Table) com sorting, pagination, column visibility, CSV export e row actions.|


11) Supabase & .env (GROWTH)

Os dados vêm do Supabase.

Todas as variáveis de ambiente necessárias serão fornecidas com o sufixo GROWTH.

Instruções obrigatórias para a geração:

Ler exclusivamente as variáveis de ambiente com sufixo GROWTH a partir do arquivo .env.

Não hardcodar URLs, chaves ou credenciais do Supabase.

Não expor segredos no cliente; respeitar o fluxo seguro definido pelo projeto.

Assumir que o schema e a tabela de referência são os citados acima; usar os nomes de colunas exatamente como listados.

Tratar ausências de dados de forma resiliente (exibir “—” onde aplicável) para KPIs dependentes de divisores.


## Supabase Schema
CREATE  TABLE public.mkt_ads_looker (
  ad_id numeric NOT NULL,
  ad_name text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  date date NULL,
  platform text NOT NULL,
  campaign_id numeric NULL,
  campaign_name text NULL,
  cost numeric NULL,
  impressions numeric NULL,
  clicks numeric NULL,
  video_3s numeric NULL,
  tap signup numeric NULL,
  tap activations numeric NULL,
  tap 5trx numeric NULL,
  tap cnpj signups numeric NULL,
  pos_sales numeric NULL,
  piselli_sales numeric NULL,
  install numeric NULL,
  signup_web numeric NULL,
  activation_app numeric NULL,
  activation_web numeric NULL,
  link_signup numeric NULL,
  link_activations numeric NULL,
  product text NULL,
  creative_link text NULL,
  creative_id text NULL,
  id text NOT NULL,
  CONSTRAINT mkt_ads_looker_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;