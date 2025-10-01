# ⚡ Teste Rápido - Validação V2

## 🚀 Start

```bash
npm run dev
# http://localhost:3000
```

---

## ✅ Checklist de 3 Minutos

### 1️⃣ Filtros Apenas via Botão (30s)

- [ ] Abra `/default/concorrente`
- [ ] Selecione plataforma "Google"
- [ ] **Cards NÃO mudam** ✅
- [ ] Botão "🔍 Aplicar Filtros" **habilitado** ✅
- [ ] Clique em "Aplicar Filtros"
- [ ] **Cards atualizam agora** ✅
- [ ] Botão mostra "✅ Filtros Aplicados" ✅

**✅ PASSOU** se cards só mudaram após clicar no botão

---

### 2️⃣ Card Sem Reload (30s)

- [ ] Na lista de anúncios, clique em qualquer card
- [ ] Modal abre **instantaneamente** ✅
- [ ] **Página NÃO recarrega** (sem "piscar") ✅
- [ ] URL muda para `/default/concorrente/ad/:id` ✅
- [ ] Clique no X para fechar
- [ ] Modal fecha **instantaneamente** ✅
- [ ] URL volta para `/default/concorrente` ✅

**✅ PASSOU** se não houve nenhum reload

---

### 3️⃣ URL Zerada ao Trocar Perspectiva (30s)

- [ ] Aplique filtro: Plataforma "Meta"
- [ ] Clique em "Aplicar Filtros"
- [ ] URL mostra: `?platform=META` ✅
- [ ] Clique no dropdown de perspectivas (canto superior esquerdo)
- [ ] Selecione "InfinitePay"
- [ ] **URL limpa**: `/infinitepay/concorrente` (SEM ?platform=META) ✅
- [ ] Tema muda para verde limão ✅
- [ ] Cards mostram TODOS os anúncios (sem filtro) ✅

**✅ PASSOU** se URL ficou limpa (sem params)

---

## 🎯 Resultado Esperado

| Teste | Status |
|-------|--------|
| Filtros via botão | ✅ |
| Card sem reload | ✅ |
| URL zerada | ✅ |

---

## 🐛 Se Algo Falhar

### Filtro está aplicando sozinho?
→ Cache do browser. Faça hard refresh: `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)

### Card está recarregando?
→ Verifique se não tem erro no console: `F12 > Console`

### URL não limpa ao trocar perspectiva?
→ Limpe o cache: `rm -rf .next && npm run dev`

---

## ✅ Tudo OK?

Se os 3 testes passaram, o sistema está funcionando **exatamente** como especificado! 🎉

---

**Tempo estimado**: 2-3 minutos  
**Última atualização**: 1 de Outubro de 2025

