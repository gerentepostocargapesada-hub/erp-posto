## FuelOps Pro — Gestão de Operações + Controle de Estoque

Aplicação React com duas abas para gestão de postos de combustível.

### Estrutura
- **Gestão de Operações** — Aba com iframe carregando o HTML original (sem alterações)
- **Controle de Estoque** — Aba React com campos editáveis para:
  - Aferições (campos digitáveis)
  - Preços por produto (digitável, com recálculo automático)
  - Bicos (importado via CSV "Vendas por Bico", resultado editável)
  - Perdas e Sobras LMC (importado via CSV, valores editáveis)
  - Pedidos e Entregas (cadastro manual completo)

### Dados de Relatórios (CSV import)
- `Vendas por Bico` → preenche a seção de Bicos
- `Perdas e Sobras LMC` → preenche a seção de Perdas e Sobras

### Valores padrão (quando não informado = 0)
- Todos os campos numéricos iniciam em zero
- Preços: Etanol 4.59, Gasolina 6.19, S500 5.69, S10 5.79, Arla 3.79

### Stack
- React 18 + TypeScript + Vite + Tailwind CSS
- Lucide React para ícones
- Sem dependência de backend

## Template Original

Este é um template moderno React com React 18, TypeScript, Vite e Tailwind CSS.

### Build Commands
- `npm run dev` — iniciar dev server
- `npm run build` — build de produção
- `npm run preview` — preview do build
