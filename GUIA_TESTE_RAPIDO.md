# ⚡ Guia de Teste Rápido - Validação das Correções

## 🚀 Iniciar Aplicação

```bash
npm run dev
# Acesse: http://localhost:3000
```

---

## ✅ Teste 1: Filtros Aplicam APENAS via Botão (2 min)

### Passos:
1. Acesse `/default/concorrente`
2. **Selecione "Google" na plataforma**
   - ❌ Cards **NÃO devem mudar**
   - ✅ Botão "Aplicar Filtros" fica **habilitado**

3. **Selecione "Vídeo" no tipo**
   - ❌ Cards **NÃO devem mudar**

4. **Digite "tap" na busca**
   - ❌ Cards **NÃO devem mudar**

5. **Clique em "Aplicar Filtros"**
   - ✅ Cards **agora atualizam**
   - ✅ Loading aparece brevemente
   - ✅ URL: `?platform=GOOGLE&type=video&search=tap`
   - ✅ Botão fica **desabilitado** (sem mudanças)

6. **Mude plataforma para "Meta"**
   - ❌ Cards **NÃO mudam**
   - ✅ Botão fica **habilitado** novamente

### ✅ Resultado Esperado
Filtros só aplicam ao clicar no botão, nunca automaticamente.

---

## ✅ Teste 2: Card Abre Sem Reload (1 min)

### Passos:
1. **Clique em qualquer card**
   - ✅ Modal abre **instantaneamente**
   - ✅ **SEM reload** da página
   - ✅ URL muda para `/default/concorrente/ad/:id`
   - ✅ Scroll não muda

2. **Teste com diferentes tipos**:
   - Google Video → ✅ YouTube embed funciona
   - Google Image → ✅ Renderiza
   - Meta Video → ✅ Player MP4 funciona
   - Meta Image → ✅ Renderiza

3. **Feche o modal (clique no X ou fora)**
   - ✅ URL volta para `/default/concorrente?...`
   - ✅ **SEM reload**

### ✅ Resultado Esperado
Modal sempre abre instantaneamente, sem recarregar página.

---

## ✅ Teste 3: URL Zera ao Trocar Perspectiva (1 min)

### Passos:
1. **Aplique filtros e abra um anúncio**:
   - Plataforma: Meta
   - Busca: "tap"
   - Abra qualquer card
   - URL atual: `/default/concorrente/ad/123?platform=META&search=tap`

2. **Clique no dropdown de perspectivas** (canto superior esquerdo)

3. **Selecione "InfinitePay"**
   - ✅ URL vira `/infinitepay/concorrente` (**limpa!**)
   - ✅ Modal **fecha**
   - ✅ Filtros **removidos**
   - ✅ Cards mostram todos de InfinitePay

4. **Selecione "JIM"**
   - ✅ URL vira `/jim/concorrente` (**limpa!**)

5. **Volte para "Default"**
   - ✅ URL vira `/default/concorrente` (**limpa!**)

### ✅ Resultado Esperado
Trocar perspectiva sempre limpa completamente a URL.

---

## 🎯 Checklist Rápido

### Filtros
- [ ] Selecionar filtro **NÃO aplica** automaticamente
- [ ] Botão "Aplicar Filtros" fica habilitado com mudanças
- [ ] Clicar no botão **aplica** os filtros
- [ ] Cards atualizam após aplicar
- [ ] URL reflete filtros aplicados

### Card/Modal
- [ ] Clique abre modal **sem reload**
- [ ] Funciona com Google Video
- [ ] Funciona com Meta Video
- [ ] URL muda para `/ad/:id`
- [ ] Fechar remove `/ad/:id` sem reload

### Perspectivas
- [ ] Trocar perspectiva **limpa** a URL
- [ ] Remove filtros
- [ ] Fecha modal (se aberto)
- [ ] Cards resetam para nova perspectiva

---

## 🐛 Problemas? Verifique:

### Cache do Next.js
Se encontrar o erro `ENOENT: no such file or directory, open '.next/...'`:

```bash
rm -rf .next
npm run dev
```

### Build
Para garantir que tudo compila:

```bash
npm run build
```

---

## ✅ Status Final

Se todos os 3 testes passarem:
- ✅ Filtros aplicam apenas via botão
- ✅ Card abre sem reload
- ✅ URL zera ao trocar perspectiva

**Correções implementadas com sucesso!** 🎉

---

**Tempo total de teste**: ~4 minutos

