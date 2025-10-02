# 📝 Changelog - Ad Intelligence Hub

Esta pasta contém o histórico detalhado de todas as mudanças significativas no projeto.

## 📋 Formato dos Arquivos

```
YYYY-MM-DD-NN-titulo-descritivo.md
```

- **YYYY-MM-DD**: Data da mudança
- **NN**: Número sequencial (01, 02, 03...)
- **titulo-descritivo**: Breve descrição da mudança

## 📚 Índice de Mudanças

### 2025-10-02

1. **[Roteamento por Perspectivas](./2025-10-02-01-roteamento-perspectivas.md)**
   - Implementação de rotas dinâmicas `/:perspectiva/concorrente`
   - Deep links via query param `?ad=<ID>`
   - URL como fonte da verdade

2. **[Filtros Sincronizados com URL](./2025-10-02-02-filtros-sincronizados-url.md)**
   - Sincronização bidirecional URL ↔ Filtros
   - Parâmetros: search, competitors, platform, assetType, dates
   - Preservação de UTMs

3. **[Correções de UX](./2025-10-02-03-correcoes-ux.md)**
   - Filtros aplicados apenas via botão (não automático)
   - Card abre sem reload (modal instantâneo)
   - URL limpa ao trocar perspectiva

4. **[Bug: Campo Platform Não Mapeado](./2025-10-02-04-bug-campo-platform.md)**
   - Interface TypeScript faltando campo `platform`
   - Correção: Adicionado à `AdsSupabaseRow`

5. **[Bug: Cards Não Atualizam](./2025-10-02-05-bug-display-cards.md)**
   - `useCallback` faltando `options.filters?.platform` nas deps
   - Correção: Adicionada dependência, simplificado `useEffect`

6. **[Fix: Vercel Build e Aplicação de Temas](./2025-10-02-06-fix-vercel-build-e-temas.md)**
   - Erro ENOENT no build do Vercel
   - Temas não sendo aplicados nas páginas de perspectiva
   - Correção: Deletado conflito de roteamento, sincronizado tema com URL

## 🎯 Como Usar Este Changelog

### Para Desenvolvedores
- Leia os logs antes de fazer mudanças relacionadas
- Entenda decisões arquiteturais e bugs corrigidos
- Evite reintroduzir bugs já resolvidos

### Para IAs (Claude, GPT, etc.)
- Leia os logs ao começar a trabalhar no projeto
- Use como contexto para entender mudanças recentes
- Consulte ao investigar bugs ou comportamentos inesperados

## 📝 Template para Novos Logs

```markdown
# YYYY-MM-DD-NN - Título da Mudança

## 📋 Contexto
Breve explicação do que motivou a mudança

## 🎯 Objetivos
- Lista de objetivos da mudança

## 🐛 Problema (se aplicável)
Descrição do bug ou problema

## ✅ Solução
Como foi resolvido

## 📝 Arquivos Modificados
- `caminho/arquivo.ts` - Descrição da mudança

## 🧪 Testes
Como testar/validar

## ⚠️ Observações
Notas importantes ou lições aprendidas
```

## 🔍 Convenções

### Emojis Padrão
- 📋 Contexto
- 🎯 Objetivos
- 🐛 Problemas/Bugs
- ✅ Soluções/Correções
- 📝 Arquivos/Código
- 🧪 Testes
- ⚠️ Avisos/Observações
- 🔧 Ferramentas/Configuração
- 📊 Impacto/Métricas
- 🔄 Fluxos/Processos

### Categorias de Mudanças
- **Feature**: Nova funcionalidade
- **Bug**: Correção de bug
- **Refactor**: Refatoração de código
- **Docs**: Documentação
- **Config**: Configuração
- **Performance**: Otimização

## 📞 Contato
Para dúvidas sobre mudanças específicas, consulte os logs ou a equipe de desenvolvimento.

