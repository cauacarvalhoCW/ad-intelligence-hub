# Projeto - Ad Hub

## Versões 

### v1 
 
- Escolha de perspectiva de vizualição de dados e tema (Cloudwalk, InfinitePay, JIM. Padrão)
- Analytics e Métricas sobre os ads dos concorrentes 
- Filtro para buscaa de ads especificos 

### v2

- Chat conversacional que com base nas perguntas listam os ads relacionados
- Adicionar os dados reais do BD (Supabase)
- Corrigir algumas issues na aplicação
- Scrape de um concorrente especifico
- Print Imagens


# 🎯 Edge Intelligence Hub - Ad Hub

> **Plataforma inteligente para análise competitiva de anúncios digitais com múltiplas perspectivas de mercado**

## 📋 Sobre o Projeto

O **Edge Intelligence Hub** é uma plataforma avançada de análise competitiva que permite monitorar, analisar e extrair insights de anúncios digitais de concorrentes. Com foco em empresas de fintech, a plataforma oferece diferentes perspectivas de visualização baseadas em contextos específicos de mercado.

---

## 🚀 Versão 0 (v0) - Features Implementadas

### 🎨 **Sistema de Temas e Perspectivas**
- **4 Perspectivas Disponíveis:**
  - **🌍 CloudWalk**: Visão global (competidores BR + US)
  - **💚 InfinitePay**: Foco no mercado brasileiro (PagBank, Stone, Cora, Ton, Mercado Pago, Jeitto)
  - **🟣 JIM**: Foco no mercado americano (Square, PayPal, Stripe, Venmo, SumUp)
  - **🏠 Padrão**: Visão completa de todos os competidores

- **Funcionalidades do Sistema de Temas:**
  - Seleção de perspectiva via dropdown no header
  - Filtragem automática de dados por tema
  - Cores e branding personalizados por empresa
  - Logos e identidade visual específica
  - Persistência da escolha do usuário

### 📊 **Dashboard Principal**
- **Visão Geral Dinâmica:**
  - Contador de anúncios filtrados por tema
  - Estatísticas de competidores ativos
  - Interface responsiva e moderna
  - Navegação por abas organizadas

### 🔍 **Sistema de Filtros Avançados**
- **Filtros Disponíveis:**
  - Busca textual (título, descrição, texto extraído)
  - Filtro por competidor específico
  - Filtro por plataforma (Facebook, Google, Instagram, LinkedIn, TikTok)
  - Filtro por tipo de anúncio (Imagem, Vídeo, Carrossel, Texto)
  - Filtro por período/data
  - Filtro por tags

### 📈 **Analytics e Métricas**
- **Análise Estatística:**
  - Distribuição por plataformas
  - Análise de concorrentes
  - Métricas de engajamento
  - Análise de tipos de anúncio
  - Top tags mais frequentes

- **Análise de Taxas:**
  - Detecção automática de taxas em anúncios
  - Extração de percentuais (0%, 2%, etc.)
  - Identificação de valores monetários
  - Palavras-chave relacionadas a ofertas
  - Estatísticas de competitividade de taxas

### 🎯 **Análise Competitiva Avançada**
- **Insights de Concorrentes:**
  - Score de sentiment automático
  - Classificação de posicionamento (Agressivo, Equilibrado, Conservador)
  - Análise de competitividade de taxas (Alta, Média, Baixa)
  - Identificação de estratégias principais
  - Matriz de posicionamento competitivo

- **Análise de Conteúdo:**
  - Temas mais frequentes por competidor
  - Análise de palavras-chave estratégicas
  - Insights sobre abordagem de mercado
  - Comparação entre concorrentes

### 📊 **Análise de Tendências**
- **Tendências Temporais:**
  - Gráficos de linha para evolução semanal
  - Análise de 8 semanas de dados
  - Tendências de anúncios com taxas
  - Distribuição por plataforma ao longo do tempo

- **Tendências de Taxas:**
  - Identificação de taxas em alta/baixa
  - Cálculo de mudanças percentuais
  - Frequência de ofertas específicas
  - Resumo semanal automatizado

### 🔧 **Extrator Inteligente de Taxas**
- **Funcionalidades de Extração:**
  - Regex avançado para percentuais
  - Detecção de valores monetários (R$, $)
  - Identificação de palavras-chave promocionais
  - Análise contextual de ofertas
  - Categorização automática de benefícios

### 🎴 **Visualização de Anúncios**
- **Cards Interativos:**
  - Preview completo do anúncio
  - Informações do competidor
  - Tags e categorização
  - Modal detalhado para análise
  - Links para landing pages

- **Modal de Detalhes:**
  - Descrição completa do anúncio
  - Análise automática de taxas
  - Texto extraído de imagens
  - Sistema de tags
  - Acesso direto à landing page

### 🌓 **Sistema de Temas Dark/Light**
- **Funcionalidades:**
  - Toggle dark/light mode
  - Persistência da preferência
  - Compatibilidade com todos os temas
  - Transições suaves
  - Acessibilidade otimizada

### 🎨 **Interface e UX**
- **Design System:**
  - Componentes baseados em Radix UI
  - Estilização com Tailwind CSS
  - Animações e transições fluidas
  - Layout responsivo
  - Acessibilidade (WCAG)

---

## 🛠️ **Stack Tecnológica**

### **Frontend**
- **Next.js 15.2.4** - Framework React com App Router
- **React 19** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4.1.9** - Framework de estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos

### **Visualização de Dados**
- **Recharts** - Gráficos e charts interativos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### **Estado e Temas**
- **Next Themes** - Gerenciamento de temas
- **Context API** - Estado global
- **Local Storage** - Persistência de preferências

### **Ferramentas de Desenvolvimento**
- **ESLint** - Linting de código
- **PostCSS** - Processamento CSS
- **Vercel Analytics** - Métricas de uso

---

## 📁 **Estrutura do Projeto**

```
edge-intelligence-hub/
├── app/                    # App Router (Next.js 13+)
├── components/            # Componentes React
│   ├── ui/               # Componentes base (Radix UI)
│   ├── ads/              # Componentes específicos de anúncios
│   ├── ad-dashboard.tsx  # Dashboard principal
│   ├── ad-analytics.tsx  # Componente de analytics
│   ├── competitive-analysis.tsx # Análise competitiva
│   ├── trend-analysis.tsx # Análise de tendências
│   └── rate-extractor.tsx # Extrator de taxas
├── hooks/                # Custom hooks
├── lib/                  # Utilitários e configurações
│   ├── types.ts         # Definições TypeScript
│   ├── themes.ts        # Configuração de temas
│   ├── mock-data.ts     # Dados de exemplo
│   └── utils/           # Funções utilitárias
└── public/              # Assets estáticos
```

---

## 🎯 **Principais Diferenciais da v0**

### ✅ **Análise Multi-Perspectiva**
- Visualização contextualizada por empresa/mercado
- Filtragem automática baseada em escopo de negócio
- Branding personalizado por perspectiva

### ✅ **Inteligência de Taxas**
- Extração automática de ofertas e taxas
- Análise competitiva de pricing
- Tendências de mercado em tempo real

### ✅ **Analytics Avançados**
- Métricas de sentiment automático
- Classificação de estratégias competitivas
- Insights acionáveis para tomada de decisão

### ✅ **UX/UI Premium**
- Interface moderna e responsiva
- Sistema de temas consistente
- Navegação intuitiva e acessível

---

## 🚀 **Como Executar**

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar versão de produção
npm start
```

---

## 📊 **Métricas da v0**

- **4 Perspectivas** de visualização implementadas
- **5+ Tipos de análise** (Analytics, Competitiva, Tendências, Taxas)
- **10+ Filtros** disponíveis
- **20+ Componentes** reutilizáveis
- **100% Responsivo** em todos os dispositivos
- **Acessibilidade WCAG** implementada

---

## 🎯 **Próximos Passos (v1)**

- [ ] Integração com APIs reais de anúncios
- [ ] Sistema de alertas e notificações
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Dashboard de ROI e performance
- [ ] Análise de sentiment com IA
- [ ] Integração com ferramentas de BI

---

**Desenvolvido com ❤️ para análise competitiva inteligente**