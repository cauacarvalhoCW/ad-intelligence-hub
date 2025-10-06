# Fix: Loop Infinito no PerfFilters (Maximum Update Depth)

**Data:** 2025-10-03  
**Tipo:** Bug Fix - Critical  
**Status:** ✅ Concluído

## 🐛 Problema

Erro "Maximum update depth exceeded" ao abrir a página de Performance, causando crash da aplicação.

```
Error: Maximum update depth exceeded. This can happen when a component 
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**Stack trace apontava para:** `PerfFilters` → `DropdownMenuContent` → `usePresence`

---

## 🔍 Causa Raiz

O componente `PerfFilters` era um **uncontrolled component** que:

1. Mantinha seu próprio estado interno (`useState`)
2. Tinha um `useEffect` que chamava `onFiltersChange` quando o estado mudava
3. `onFiltersChange` atualizava o estado do componente pai
4. Componente pai re-renderizava e passava nova função `onFiltersChange` (via `useCallback`)
5. `useEffect` detectava mudança em `onFiltersChange` (dependência)
6. **LOOP INFINITO!** 🔁

### Código Problemático

```typescript
// ❌ ANTES (Uncontrolled - causava loop)
export function PerfFilters({ onFiltersChange }: Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([...]);
  const [selectedRange, setSelectedRange] = useState("7d");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔥 LOOP INFINITO AQUI!
  useEffect(() => {
    onFiltersChange?.({
      platforms: selectedPlatforms,
      range: selectedRange,
      searchQuery,
    });
  }, [selectedPlatforms, selectedRange, searchQuery, onFiltersChange]);
  //                                                   ^^^^^^^^^^^^^^^^
  //                                                   Esta dependência
  //                                                   recria a cada render!

  return (
    <Button onClick={() => setSelectedPlatforms([...])} />
  );
}
```

**Fluxo do bug:**
```
1. User click → setState
2. useEffect → onFiltersChange()
3. Parent updates → new onFiltersChange function
4. useEffect detecta mudança → volta pro passo 2
5. INFINITO! 💥
```

---

## ✅ Solução

Refatorar `PerfFilters` para ser um **controlled component**:

1. Remove estado interno
2. Recebe valores como props (`value`)
3. Chama callback quando muda (`onChange`)
4. Remove `useEffect` (não precisa mais!)

### Código Corrigido

```typescript
// ✅ DEPOIS (Controlled - sem loop)
interface PerfFiltersProps {
  value: {
    platforms: Platform[];
    range: RangePreset;
    dateRange?: DateRangeFilter;
    searchQuery?: string;
  };
  onChange: (filters: {...}) => void;
}

export function PerfFilters({ value, onChange }: PerfFiltersProps) {
  // Derive values from props (no useState!)
  const selectedPlatforms = value.platforms;
  const selectedRange = value.range;
  const searchQuery = value.searchQuery || "";

  // Call onChange directly (no useEffect!)
  const togglePlatform = (platform: Platform) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];
    
    onChange({
      ...value,
      platforms: newPlatforms,
    });
  };

  return (
    <Button onClick={() => togglePlatform("META")} />
  );
}
```

**Fluxo corrigido:**
```
1. User click → onChange(newValue)
2. Parent updates → new value prop
3. Component re-renders with new value
4. FIM! ✅ (não há loop)
```

---

## 📝 Arquivos Modificados

```
✅ features/performance/components/PerfFilters.tsx
   - Interface atualizada: `onFiltersChange` → `value` + `onChange`
   - Removido todo `useState` interno
   - Removido `useEffect` problemático
   - Derivar valores de `value` prop
   - Chamar `onChange` diretamente nos handlers

✅ features/performance/components/OverviewContent.tsx
   - `<PerfFilters onFiltersChange={setFilters} />`
   → `<PerfFilters value={filters} onChange={setFilters} />`

✅ features/performance/components/DrilldownContent.tsx
   - `<PerfFilters onFiltersChange={setFilters} />`
   → `<PerfFilters value={filters} onChange={setFilters} />`
```

---

## 🧪 Validações

### Antes (Quebrado)
```bash
❌ Abrir /default/performance → CRASH (loop infinito)
❌ Abrir /default/performance/pos → CRASH (loop infinito)
❌ Console: Maximum update depth exceeded
```

### Depois (Corrigido)
```bash
✅ Abrir /default/performance → Carrega normalmente
✅ Abrir /default/performance/pos → Carrega normalmente
✅ Mudar filtros → Funciona sem loops
✅ Browser back/forward → Funciona
✅ Refresh → Mantém filtros
```

---

## 💡 Lições Aprendidas

### 1. Controlled vs Uncontrolled Components

**Uncontrolled (problema):**
- Componente mantém próprio estado
- Sincroniza com pai via `useEffect`
- Propenso a loops infinitos

**Controlled (solução):**
- Componente recebe valores como props
- Notifica mudanças via callback
- Pai gerencia o estado

### 2. useEffect com Callbacks nas Dependências

```typescript
// ❌ PERIGOSO
useEffect(() => {
  callback();
}, [callback]); // callback recria a cada render!

// ✅ SEGURO - Opção 1: Remover callback das deps
useEffect(() => {
  callback();
}, [value1, value2]); // só deps primitivas

// ✅ SEGURO - Opção 2: useCallback no pai com deps fixas
const callback = useCallback(() => {
  // ...
}, []); // deps vazias ou estáveis

// ✅ MELHOR - Opção 3: Não usar useEffect!
const handleChange = () => {
  callback(); // chama diretamente no event handler
};
```

### 3. Padrão "Value + onChange"

```typescript
// ✅ Pattern padrão do React (igual <input>)
<PerfFilters
  value={filters}
  onChange={setFilters}
/>

// Similar a:
<input
  value={text}
  onChange={(e) => setText(e.target.value)}
/>
```

### 4. Debugging Loop Infinitos

**Sinais:**
- "Maximum update depth exceeded"
- CPU 100%
- Navegador trava
- React DevTools mostra renders infinitos

**Como achar:**
- Procure `useEffect` com callbacks nas dependências
- Procure `useEffect` que atualiza estado que trigger outro `useEffect`
- Use React DevTools Profiler para ver loop de renders

---

## 🔧 Padrão Recomendado

Para componentes de formulário/filtros no projeto:

```typescript
// ✅ SEMPRE usar controlled components
interface FilterComponentProps {
  value: FilterState;
  onChange: (newValue: FilterState) => void;
}

export function FilterComponent({ value, onChange }: Props) {
  // Derive, não armazene
  const field1 = value.field1;
  
  // Chame onChange diretamente
  const handleChange = (newField1: string) => {
    onChange({ ...value, field1: newField1 });
  };
  
  // SEM useState interno!
  // SEM useEffect de sincronização!
  
  return <Input value={field1} onChange={handleChange} />;
}
```

---

## 🎯 Impacto

**Antes:**
- ❌ Aplicação crashava ao abrir Performance
- ❌ Usuários não conseguiam usar o módulo
- ❌ Erro crítico que bloqueava toda a feature

**Depois:**
- ✅ Aplicação funciona normalmente
- ✅ Filtros funcionam corretamente
- ✅ UX fluida sem loops

---

## 🚀 Melhorias Futuras

### 1. Abstrair Pattern de Controlled Form
```typescript
// Hook reutilizável para controlled forms
function useControlledForm<T>(value: T, onChange: (v: T) => void) {
  const updateField = useCallback((field: keyof T, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  }, [value, onChange]);
  
  return { value, updateField };
}
```

### 2. Validação de Props
```typescript
// Adicionar validação em dev mode
if (process.env.NODE_ENV === 'development') {
  if (!value || !onChange) {
    console.warn('PerfFilters: value and onChange props are required');
  }
}
```

---

## 📊 Métricas

```
⏱️ Tempo para diagnóstico: 10min
⏱️ Tempo para correção: 15min
📁 Arquivos modificados: 3
📝 Linhas alteradas: ~80
🐛 Severidade: CRÍTICA (bloqueava feature completa)
✅ Status: RESOLVIDO
```

---

**Status:** ✅ Bug Crítico Resolvido  
**Prioridade:** CRÍTICA (P0)  
**Root Cause:** Uncontrolled component com useEffect em callback  
**Fix:** Refatorado para controlled component

---

**Conclusão:**

O bug foi causado por um antipattern comum: uncontrolled component tentando sincronizar com pai via `useEffect`. A solução foi seguir o padrão React de controlled components (`value` + `onChange`), eliminando completamente o problema.

**Takeaway:** Componentes de formulário devem SEMPRE ser controlled! 🎯


