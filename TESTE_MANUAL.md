# 🧪 Guia de Teste Manual - Validação das Correções

## 🚀 Como Testar

### Preparação
```bash
npm run dev
# Acesse: http://localhost:3000
```

---

## ✅ Teste 1: Filtros Aplicam Instantaneamente

### Passos:
1. Acesse `/default/concorrente` (ou qualquer perspectiva)
2. **Selecione uma plataforma** (ex: "Google")
   - ✅ **Esperar**: Cards atualizam **imediatamente**
   - ✅ **Esperar**: Indicador de loading aparece brevemente
   - ✅ **Esperar**: URL muda para `?platform=GOOGLE`

3. **Selecione um tipo** (ex: "Vídeo")
   - ✅ **Esperar**: Cards atualizam **imediatamente**
   - ✅ **Esperar**: URL muda para `?platform=GOOGLE&type=video`

4. **Selecione data inicial e final**
   - ✅ **Esperar**: Cards atualizam **imediatamente** após cada seleção
   - ✅ **Esperar**: URL reflete as datas

5. **Digite no campo de busca** (ex: "cartão")
   - ✅ **Esperar**: Cards atualizam após **500ms** (debounce)
   - ✅ **Esperar**: URL muda para `?...&search=cartão`

6. **Selecione competidores** (marque 2-3 checkboxes)
   - ✅ **Esperar**: Cards atualizam **imediatamente**
   - ✅ **Esperar**: Badges de filtros aparecem no topo

7. **Clique no X de um filtro ativo**
   - ✅ **Esperar**: Cards atualizam **imediatamente**
   - ✅ **Esperar**: Badge desaparece

8. **Clique em "Limpar Todos"**
   - ✅ **Esperar**: Todos os filtros são removidos
   - ✅ **Esperar**: Cards mostram todos os anúncios da perspectiva
   - ✅ **Esperar**: URL volta para `/default/concorrente` (sem query params)

### ❌ Comportamento Anterior (Bug)
- Filtros não aplicavam sem trocar de página
- Era necessário navegar para outra aba e voltar

### ✅ Comportamento Atual (Corrigido)
- Filtros aplicam instantaneamente ao selecionar
- Busca tem debounce de 500ms
- Cards atualizam sem necessidade de navegação

---

## ✅ Teste 2: Card Abre Sem Reload

### Passos:
1. Na página de anúncios, **clique em qualquer card**
   - ✅ **Esperar**: Modal abre **instantaneamente** (sem reload)
   - ✅ **Esperar**: URL muda para `/perspectiva/concorrente/ad/:id`
   - ✅ **Esperar**: Scroll não muda
   - ✅ **Esperar**: Filtros permanecem ativos

2. **Copie a URL completa** (Ctrl+L ou Cmd+L)
   - Exemplo: `http://localhost:3000/infinitepay/concorrente/ad/123456?platform=META`

3. **Abra a URL em nova aba** (Ctrl+click ou Cmd+click)
   - ✅ **Esperar**: Página carrega com modal **já aberto**
   - ✅ **Esperar**: Filtros da URL são aplicados corretamente

4. **Feche o modal** (clique no X ou fora do modal)
   - ✅ **Esperar**: Modal fecha **instantaneamente**
   - ✅ **Esperar**: URL volta para `/perspectiva/concorrente?...filtros`
   - ✅ **Esperar**: Filtros permanecem ativos

5. **Teste com diferentes tipos de anúncio**:
   - Google Video (YouTube embed)
   - Google Image/Text
   - Meta Video (.mp4)
   - Meta Image

### ❌ Comportamento Anterior (Bug)
- Página recarregava ao clicar no card
- Google Ads não abriam corretamente em alguns casos
- Histórico do browser ficava poluído

### ✅ Comportamento Atual (Corrigido)
- Modal abre instantaneamente sem reload
- URL atualiza para deep linking
- Google Ads renderizam corretamente
- Sem adição desnecessária ao histórico

---

## ✅ Teste 3: Troca de Perspectiva Preserva Filtros

### Passos:
1. **Aplique múltiplos filtros**:
   - Plataforma: Meta
   - Busca: "tap"
   - Data: últimos 30 dias
   
   URL esperada: `/default/concorrente?platform=META&search=tap&dateFrom=2024-09-01&dateTo=2024-10-01`

2. **Adicione UTMs à URL manualmente**:
   - Cole: `?platform=META&search=tap&utm_source=email&utm_campaign=test`
   - ✅ **Esperar**: Filtros e UTMs ativos

3. **Clique no dropdown de perspectivas** (canto superior esquerdo)

4. **Selecione "InfinitePay"**
   - ✅ **Esperar**: Tema muda para verde limão
   - ✅ **Esperar**: URL muda para `/infinitepay/concorrente?platform=META&search=tap&utm_source=email&utm_campaign=test`
   - ✅ **Esperar**: Todos os filtros permanecem ativos
   - ✅ **Esperar**: UTMs são preservados
   - ✅ **Esperar**: Cards atualizam para competidores BR

5. **Selecione "JIM"**
   - ✅ **Esperar**: Tema muda para roxo
   - ✅ **Esperar**: URL muda para `/jim/concorrente?...`
   - ✅ **Esperar**: Filtros e UTMs mantidos
   - ✅ **Esperar**: Cards atualizam para competidores US

6. **Selecione "CloudWalk"**
   - ✅ **Esperar**: Todos os competidores (BR + US)
   - ✅ **Esperar**: Filtros e UTMs mantidos

7. **Verifique o badge "Tema ativo"** (canto superior direito)
   - ✅ **Esperar**: Cor do círculo muda conforme perspectiva
   - ✅ **Esperar**: Nome correto da perspectiva exibido

### ❌ Comportamento Anterior (Bug)
- URL não acompanhava mudança de perspectiva
- Filtros eram perdidos ao trocar tema
- UTMs desapareciam

### ✅ Comportamento Atual (Corrigido)
- URL sempre sincronizada com perspectiva
- Filtros preservados durante troca
- UTMs mantidos em toda navegação
- Context atualizado corretamente

---

## ✅ Teste 4: Browser History Funcional

### Passos:
1. Navegue pela aplicação aplicando filtros:
   - Aplique filtro de plataforma
   - Aplique filtro de busca
   - Abra um card
   - Feche o card
   - Troque de perspectiva

2. **Use o botão "Voltar" do browser** (várias vezes)
   - ✅ **Esperar**: Cada ação é revertida na ordem correta
   - ✅ **Esperar**: Filtros são restaurados
   - ✅ **Esperar**: Modal fecha/abre conforme histórico

3. **Use o botão "Avançar" do browser**
   - ✅ **Esperar**: Navega para frente no histórico
   - ✅ **Esperar**: Estado da aplicação corresponde à URL

### ✅ Comportamento Esperado
- Histórico do browser reflete ações do usuário
- Voltar/Avançar funciona corretamente
- Estado da aplicação sempre consistente com URL

---

## ✅ Teste 5: Edge Cases e Validações

### Caso 1: Perspectiva Inválida
```
URL: http://localhost:3000/invalid/concorrente
```
- ✅ **Esperar**: Redirect automático para `/default/concorrente`

### Caso 2: Deep Link com Filtros
```
URL: http://localhost:3000/infinitepay/concorrente?platform=META&search=tap&type=video
```
- ✅ **Esperar**: Perspectiva InfinitePay
- ✅ **Esperar**: Filtros aplicados: Meta, busca "tap", tipo vídeo
- ✅ **Esperar**: Cards filtrados corretamente

### Caso 3: Deep Link de Anúncio com Filtros
```
URL: http://localhost:3000/jim/concorrente/ad/123456?platform=GOOGLE
```
- ✅ **Esperar**: Perspectiva JIM
- ✅ **Esperar**: Modal do anúncio #123456 aberto
- ✅ **Esperar**: Filtro de plataforma Google ativo

### Caso 4: Legacy `?ad=` (Compatibilidade)
```
URL: http://localhost:3000/default/concorrente?ad=123456&platform=META
```
- ✅ **Esperar**: Redirect para `/default/concorrente/ad/123456?platform=META`
- ✅ **Esperar**: Modal aberto
- ✅ **Esperar**: Filtro preservado

---

## 📊 Checklist de Validação Completa

### Filtros
- [ ] Plataforma aplica instantaneamente
- [ ] Tipo de anúncio aplica instantaneamente
- [ ] Datas aplicam instantaneamente
- [ ] Competidores aplicam instantaneamente
- [ ] Busca de texto aplica com debounce (500ms)
- [ ] Limpar filtros individuais funciona
- [ ] Limpar todos os filtros funciona
- [ ] URL reflete filtros ativos
- [ ] Filtros da URL são aplicados ao carregar página

### Anúncios
- [ ] Clicar em card abre modal sem reload
- [ ] Modal fecha sem reload
- [ ] URL reflete anúncio aberto (`/ad/:id`)
- [ ] Deep link de anúncio funciona
- [ ] Google Video (YouTube) renderiza
- [ ] Google Image/Text renderizam
- [ ] Meta Video renderiza
- [ ] Meta Image renderiza

### Perspectivas
- [ ] Trocar perspectiva preserva filtros
- [ ] Trocar perspectiva preserva UTMs
- [ ] URL reflete perspectiva atual
- [ ] Tema visual muda corretamente
- [ ] Competidores filtrados por perspectiva
- [ ] Deep link de perspectiva funciona

### Navegação
- [ ] Browser back funciona corretamente
- [ ] Browser forward funciona corretamente
- [ ] Histórico não fica poluído
- [ ] Scroll position é preservado ao abrir modal

### Performance
- [ ] Loading indicators aparecem durante buscas
- [ ] Debounce evita requisições excessivas
- [ ] Filtros aplicam sem lag perceptível
- [ ] Build compila sem erros (`npm run build`)

---

## 🐛 Como Reportar Problemas

Se encontrar algum comportamento diferente do esperado:

1. **Descreva o sintoma exato**
   - O que você esperava?
   - O que aconteceu?

2. **Passos para reproduzir**
   - Liste exatamente o que fez

3. **Informações do ambiente**
   - URL completa
   - Browser e versão
   - Console errors (F12 > Console)

4. **Screenshots/Videos**
   - Se possível, grave a tela mostrando o problema

---

**Última atualização**: 1 de Outubro de 2025  
**Versão das correções**: 1.0.0

