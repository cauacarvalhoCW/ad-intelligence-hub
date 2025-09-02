# Prompt: Converter V0 para Executável + Temas Dinâmicos

## Contexto
Tenho um projeto do V0 (edge-intelligence-hub) que precisa ser convertido para rodar localmente e depois receber temas dinâmicos das marcas CloudWalk, InfinitePay e JIM.

## PASSO 1: Tornar o V0 Executável

### Problemas Comuns do V0 para Resolver:
1. **Package.json**: Adicionar dependências que estão faltando
2. **Imports**: Corrigir imports que não existem
3. **Componentes**: Criar componentes shadcn/ui que estão sendo importados mas não existem
4. **CSS**: Configurar Tailwind corretamente
5. **TypeScript**: Resolver erros de tipos

### Dependências Necessárias:
```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.294.0"
  }
}
```

### Componentes Shadcn/ui para Criar:
- `components/ui/card.tsx`
- `components/ui/button.tsx` 
- `components/ui/badge.tsx`
- `components/ui/tabs.tsx`
- `components/ui/input.tsx`
- `lib/utils.ts` (função cn)

### Configuração Tailwind:
```js
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        // ... outras cores shadcn
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### CSS Base (globals.css):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}
```

## PASSO 2: Implementar Temas Dinâmicos

### Temas das Marcas:

#### CloudWalk (Azul Metálico)
```typescript
cloudwalk: {
  name: "CloudWalk",
  colors: {
    primary: "#4091ff",    // Azul metálico
    secondary: "#6366f1",  // Roxo complementar  
    accent: "#8b5cf6",     // Roxo
    background: "#ffffff", // Branco
    foreground: "#000000", // Preto
  },
  logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp2P4mt6JT8FAn2UxNDNFdEYDrDKXiZHJ5Gw&s"
}
```

#### InfinitePay (Verde Neon + Roxo + Fundo Preto)
```typescript
infinitepay: {
  name: "InfinitePay", 
  colors: {
    primary: "#9AFF00",    // Verde neon
    secondary: "#8b5cf6",  // Roxo
    accent: "#7c3aed",     // Roxo escuro
    background: "#000000", // Preto
    foreground: "#ffffff", // Branco
  },
  logo: "https://play-lh.googleusercontent.com/JCYKHXuu2Q6IzhmkW9N4bDX0S8_3XVYnlPtheNcdwlOaSr0TTKJljm3RVexsXkw3_ec"
}
```

#### JIM (Roxo + Fundo Branco + Cards Preto/Branco)
```typescript
jim: {
  name: "JIM",
  colors: {
    primary: "#8b5cf6",    // Roxo
    secondary: "#7c3aed",  // Roxo escuro
    accent: "#6d28d9",     // Roxo mais escuro
    background: "#ffffff", // Branco
    foreground: "#000000", // Preto
  },
  logo: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e9/62/3f/e9623f41-4863-8796-6387-f63cae9098e9/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/1200x600wa.png"
}
```

### Implementação dos Temas:

#### 1. ThemeProvider Context:
```typescript
// components/theme-provider.tsx
"use client"
import { createContext, useContext, useState } from "react"

const themes = {
  default: { name: "Padrão", colors: { primary: "#000000", background: "#ffffff" } },
  cloudwalk: { /* cores acima */ },
  infinitepay: { /* cores acima */ },
  jim: { /* cores acima */ }
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState("default")
  
  const setTheme = (theme) => {
    setCurrentTheme(theme)
    // Aplicar CSS custom properties
    const root = document.documentElement
    const themeConfig = themes[theme]
    root.style.setProperty("--primary", themeConfig.colors.primary)
    root.style.setProperty("--background", themeConfig.colors.background)
    // ... outras propriedades
  }
  
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

#### 2. Header com Seleção de Tema:
```typescript
// components/header.tsx
export function Header() {
  const { currentTheme, setTheme, themes } = useTheme()
  
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <h1 className="text-2xl font-bold">Edge Intelligence Hub</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Tema:</span>
          {Object.entries(themes).map(([key, theme]) => (
            <Button
              key={key}
              variant={currentTheme === key ? "default" : "outline"}
              onClick={() => setTheme(key)}
              className="flex items-center gap-2"
            >
              {theme.logo && (
                <img src={theme.logo} alt={theme.name} className="w-4 h-4" />
              )}
              {theme.name}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
```

#### 3. CSS Dinâmico para Temas:
```css
/* globals.css - adicionar após as variáveis base */

/* Tema CloudWalk */
.theme-cloudwalk {
  --primary: 64 145 255; /* #4091ff em HSL */
  --secondary: 99 102 241; /* #6366f1 em HSL */
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
}

/* Tema InfinitePay */
.theme-infinitepay {
  --primary: 81 100% 50%; /* #9AFF00 em HSL */
  --secondary: 258 90% 66%; /* #8b5cf6 em HSL */
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
}

/* Tema JIM */
.theme-jim {
  --primary: 258 90% 66%; /* #8b5cf6 em HSL */
  --secondary: 262 83% 58%; /* #7c3aed em HSL */
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
}
```

#### 4. Aplicar Tema no Body:
```typescript
// No ThemeProvider, adicionar:
useEffect(() => {
  document.body.className = currentTheme !== "default" ? `theme-${currentTheme}` : ""
}, [currentTheme])
```

### Filtros por Tema:
```typescript
// Adicionar lógica para filtrar anúncios baseado no tema
const getCompetitorsByTheme = (theme) => {
  switch(theme) {
    case 'infinitepay': return ['Mercado Pago', 'Stone', 'PagBank'] // Brasil
    case 'jim': return ['Square', 'PayPal', 'Stripe'] // EUA  
    case 'cloudwalk': return [] // Todos
    default: return [] // Todos
  }
}
```

## Checklist de Implementação:

### Passo 1 - Executável:
- [ ] `npm install` das dependências necessárias
- [ ] Criar componentes shadcn/ui faltantes
- [ ] Configurar tailwind.config.js
- [ ] Adicionar CSS base no globals.css
- [ ] Resolver erros de TypeScript
- [ ] Testar se `npm run dev` funciona

### Passo 2 - Temas:
- [ ] Criar ThemeProvider com as 4 marcas
- [ ] Atualizar Header com seleção de tema
- [ ] Adicionar logos reais das marcas (URLs)
- [ ] Implementar CSS dinâmico para cada tema
- [ ] Aplicar cores nos componentes (botões, cards, etc.)
- [ ] Testar troca de temas funcionando
- [ ] Verificar se as cores ficaram "sensacionais" como solicitado

## Resultado Final:
- ✅ Projeto V0 rodando localmente sem erros
- ✅ Temas dinâmicos com cores exatas das marcas
- ✅ Header com logos reais (não base64)
- ✅ Troca de tema mudando toda a interface
- ✅ Cores "sensacionais" para InfinitePay (verde/roxo/preto), JIM (roxo/branco/cards pretos) e CloudWalk (azul metálico/roxo)
