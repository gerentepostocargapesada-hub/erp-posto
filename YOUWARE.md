# FuelOps Pro - Sistema de Gestão de Postos de Combustível

## Visão Geral
Sistema completo para gestão de operações e estoque de postos de combustível, construído com React 18, TypeScript, Vite e Tailwind CSS.

## Estrutura de Abas (Tabs)
| Aba | Componente | Descrição |
|-----|-----------|-----------|
| **Gestão de Operações** | `GestaoOperacoes.tsx` | Controle completo de operações: bicos, abastecimentos, vendas, LMC, pedidos, auditorias. Renderiza via iframe (`gestao-operacoes.html`). |
| **Controle de Estoque** | `ControleEstoque.tsx` | Gestão de estoque com upload CSV, cálculos de resultado/vendas/perdas, painel de aferições, pedidos a fornecedores, gráfico de impacto. |
| **Financeiro** | `Financeiro.tsx` | Lançamentos manuais financeiros: Caixas (com alerta de cancelamentos vs média histórica 12 meses), Notas a Prazo, Cheques, Descontos/Autorizações, Margens e Custos Operacionais. Validação BR (parseBR/fmtBR), cores condicionais (verde/vermelho), alerta visual vermelho quando cancelamentos >15% acima da média. |
| **Gestão de Equipe** | `GestaoEquipe.tsx` | Aba "Ponto": leitura automática de planilha Excel (upload com drag & drop). Parsing de Turno 1/2 (Frentistas + Caixas), Noite e Outros Colaboradores (Gerentes, Limpeza, Segurança, Troca de Óleo, Segurança Dia), Classificação de Vendas Caixas com cálculo automático de participação %. Persistência por data no localStorage (`fuelops_ponto_data`). Interface 100% read-only. |

## Checkpoints / Versões

### v2.0-ponto (2026-06-10)
- **Status:** ✅ Aba Ponto (Gestão de Equipe) — Leitura Automática de Documentos
- **Descrição:** Refatoração completa da aba "Gestão de Equipe" para operar exclusivamente via upload de planilha Excel. Removido todo o lançamento manual de dados. Interface 100% read-only.
- **Dependência:** `xlsx` (SheetJS 0.18.5) para parsing de planilhas no cliente.
- **Funcionalidades:**
  - Upload de planilha com drag & drop (DropZone)
  - Nome do arquivo `FECHAMENTO Gestão de Equipe MM-AA.xlsx` define mês/ano
  - Parsing completo: Turno 1/2 (Frentistas + Caixas), staff categorizado (Gerentes, Limpeza, Segurança, Troca de Óleo, Segurança Dia), Vendas Frentistas (Diesel/Gasolina), Vendas Noite, Classificação de Vendas Caixas
  - Conversão automática de valores Excel (frações de tempo, serial dates)
  - Cálculo automático de PARTICIPAÇÃO (%) por operadora
  - Persistência por período no localStorage (`fuelops_ponto_data`)
  - Seletor de data (Mês/Ano) com navegação de anos — exibe badge ✓ quando período tem dados
  - Botão para remover dados do período
  - IDs estáveis via `crypto.randomUUID()`
- **Interface:** Dark theme, tabelas read-only, grid 2 colunas para turnos, cards agrupados por categoria

### v1.2-equipe (2026-06-09)
- **Tag Git:** `v1.2-equipe`
- **Status:** ✅ Aba Gestão de Equipe completa e funcional
- **Descrição:** Nova aba "Gestão de Equipe" com escalas de turnos e férias (Turno 1, Turno 2, Noite e Outros), classificação de vendas por operadoras com cálculo automático de participação, persistência por data no localStorage, seletor de mês/ano sincronizado.
- **Funcionalidades:**
  - Seletor de data (Mês/Ano) com navegação de anos (Anterior/Próximo)
  - 3 tabelas de turnos com lançamento manual de colaboradores (horários, nome, líder, férias, demissão)
  - Tabela de classificação de vendas com cálculo automático de participação %
  - Persistência por período no localStorage (`fuelops_equipe_data`)
  - IDs estáveis via `crypto.randomUUID()` para evitar bugs de foco

> Para voltar a esta versão: `git checkout v1.2-equipe`

### v1.1-financeiro (2026-06-08)
- **Tag Git:** `v1.1-financeiro`
- **Commit:** `8ee2533`
- **Status:** ✅ Aba Financeiro completa e funcional
- **Descrição:** Todas as funcionalidades da aba Financeiro implementadas: Caixas (com alerta de cancelamentos vs média histórica 12 meses), Notas a Prazo, Cheques, Descontos/Autorizações, Margens e Custos Operacionais. Correção do dropdown do seletor de meses centralizado para evitar corte na navegação de ano.
- **Funcionalidades:**
  - Lançamentos manuais financeiros completos
  - Validação BR (parseBR/fmtBR) para valores monetários
  - Cores condicionais (verde/vermelho) para valores positivos/negativos
  - Alerta visual vermelho quando cancelamentos >15% acima da média
  - Seletor de meses com navegação de ano centralizado

> Para voltar a esta versão: `git checkout v1.1-financeiro`

### v1.0-baseline (2026-06-08)
- **Tag Git:** `v1.0-baseline`
- **Commit:** `59515ee`
- **Status:** ✅ Baseline estable - todas as abas funcionando perfeitamente
- **Descrição:** Versão estável com Gestão de Operações e Controle de Estoque. Ponto de retorno seguro.

> Para voltar a esta versão: `git checkout v1.0-baseline`

## Stack Técnico
- **Framework:** React 18 + TypeScript
- **Build:** Vite 7.x
- **Estilo:** Tailwind CSS 3.x
- **Ícones:** Lucide React
- **Estado:** React hooks (useState, useCallback, useMemo)
- **Idioma:** Português Brasileiro (pt-BR)

## Convenções
- Componentes em `src/pages/` são responsáveis por cada aba
- O App.tsx controla a navegação por tabs via estado local
- Interface dark theme com paleta (#10131a bg, #00a572 accent)
- Formatação numérica pt-BR com separadores brasileiros
- CSV delimiter padrão: `;` (ponto e vírgula)
- Validação financeira: `parseBR()` para parse "37.997,84" → 37997.84, `fmtBR()` para formatação
- Cores condicionais: `text-[#4edea3]` (verde, >=0), `text-[#f87171]` (vermelho, <0)
- Componente `BRInput` reutilizável para entrada de valores monetários
