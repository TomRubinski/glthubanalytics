# Arquitetura do Projeto - GitHub Analytics

## 📁 Estrutura de Diretórios

```
git-report/
├── components/              # Componentes React reutilizáveis
│   ├── ActivityHeatmap.tsx  # Mapa de calor de atividade
│   ├── Charts.tsx           # Componentes de gráficos (Recharts)
│   ├── LoadingSpinner.tsx   # Indicador de carregamento
│   ├── LoginCard.tsx        # Card de login com GitHub OAuth
│   ├── StatsGrid.tsx        # Grid de estatísticas
│   └── Timeline.tsx         # Timeline de commits
│
├── lib/                     # Lógica de negócio e utilitários
│   ├── github-analyzer.ts   # Classe principal de análise do GitHub
│   ├── pdf-generator.ts     # Geração de relatórios em PDF
│   └── chart-utils.ts       # Preparação de dados para gráficos
│
├── pages/                   # Páginas Next.js e API Routes
│   ├── api/                 # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth].ts  # Configuração NextAuth
│   │   ├── analyze.ts       # Endpoint de análise
│   │   ├── repositories.ts  # Endpoint de repositórios
│   │   ├── branches.ts      # Endpoint de branches
│   │   └── timeline.ts      # Endpoint de timeline
│   ├── _app.tsx             # App wrapper com SessionProvider
│   ├── _document.tsx        # Document customizado
│   ├── index.tsx            # Página inicial (login)
│   └── dashboard.tsx        # Dashboard principal
│
├── styles/                  # Estilos globais
│   └── globals.css          # Design system e estilos base
│
├── types/                   # Definições TypeScript
│   ├── index.ts             # Tipos principais
│   └── next-auth.d.ts       # Extensões NextAuth
│
├── .env.local.example       # Template de variáveis de ambiente
├── .gitignore               # Arquivos ignorados pelo Git
├── INSTALL.md               # Guia de instalação
├── README.md                # Documentação principal
├── next.config.js           # Configuração Next.js
├── package.json             # Dependências e scripts
└── tsconfig.json            # Configuração TypeScript
```

## 🏗️ Arquitetura

### Frontend (Next.js + React)

#### Páginas
- **`/` (index.tsx):** Página de login com GitHub OAuth
- **`/dashboard` (dashboard.tsx):** Interface principal de análise

#### Componentes

1. **LoginCard**
   - Autenticação via GitHub OAuth
   - Design premium com glassmorphism
   - Animações suaves

2. **StatsGrid**
   - Exibição de métricas principais
   - Cards animados com gradientes
   - Categorização por cores

3. **Charts**
   - CommitsOverTimeChart: Linha temporal de commits
   - LinesChangedChart: Barras de adições/remoções
   - LanguageDistributionChart: Pizza de linguagens
   - HourlyActivityChart: Atividade por horário

4. **ActivityHeatmap**
   - Mapa de calor de contribuições
   - Visualização de padrões temporais

5. **Timeline**
   - Histórico detalhado de commits
   - Informações de SHA, mensagem e estatísticas

### Backend (API Routes)

#### Autenticação
- **NextAuth.js** com GitHub Provider
- Gerenciamento de sessão
- Armazenamento seguro de tokens

#### Endpoints

1. **`POST /api/analyze`**
   - Analisa repositório no período especificado
   - Retorna estatísticas completas
   - Requer autenticação

2. **`GET /api/repositories`**
   - Lista repositórios do usuário
   - Ordenados por atualização
   - Requer autenticação

3. **`GET /api/branches`**
   - Lista branches de um repositório
   - Requer autenticação

4. **`POST /api/timeline`**
   - Gera timeline de commits
   - Retorna eventos agrupados por data
   - Requer autenticação

### Serviços

#### GitHubAnalyzer
Classe principal para interação com a API do GitHub:

```typescript
class GitHubAnalyzer {
  // Busca commits com detalhes
  async fetchCommits(params: AnalysisParams): Promise<Commit[]>
  
  // Analisa repositório completo
  async analyzeRepository(params: AnalysisParams): Promise<CommitStats>
  
  // Lista repositórios do usuário
  async getRepositories(username: string): Promise<Repository[]>
  
  // Lista branches do repositório
  async getBranches(owner: string, repo: string): Promise<string[]>
  
  // Gera timeline de commits
  generateTimeline(commits: Commit[]): TimelineEvent[]
}
```

**Funcionalidades:**
- Paginação automática de commits
- Detecção de linguagens por extensão
- Extração de palavras-chave
- Análise temporal (dia, hora, dia da semana)
- Cálculo de estatísticas agregadas

#### PDF Generator
Geração de relatórios profissionais:

```typescript
// Gera PDF completo do relatório
async function generatePDFReport(report: AnalysisReport): Promise<void>

// Captura gráfico como imagem
async function captureChartAsPNG(elementId: string): Promise<string>
```

#### Chart Utils
Preparação de dados para visualizações:

```typescript
// Prepara dados de commits ao longo do tempo
function prepareCommitsOverTimeData(...)

// Prepara dados de linhas mudadas semanalmente
function prepareLinesChangedWeeklyData(...)

// Prepara dados de distribuição de linguagens
function prepareLanguageDistributionData(...)

// Prepara dados de atividade por horário
function prepareHourlyActivityData(...)
```

## 🎨 Design System

### Paleta de Cores
- **Primary:** `hsl(250, 84%, 54%)` - Roxo vibrante
- **Secondary:** `hsl(280, 70%, 58%)` - Roxo claro
- **Accent:** `hsl(340, 82%, 52%)` - Rosa
- **Success:** `hsl(142, 76%, 36%)` - Verde
- **Error:** `hsl(0, 84%, 60%)` - Vermelho

### Efeitos Visuais
- **Glassmorphism:** Efeito de vidro fosco
- **Gradientes:** Transições suaves de cores
- **Animações:** Fade in, slide in, hover effects
- **Shadows:** Sombras em múltiplas camadas

### Tipografia
- **Fonte:** Inter (Google Fonts)
- **Pesos:** 400, 500, 600, 700, 800

## 🔐 Segurança

### Autenticação
- OAuth 2.0 com GitHub
- Tokens armazenados em sessão segura
- CSRF protection via NextAuth

### Autorização
- Middleware de autenticação em todas as APIs
- Verificação de sessão em cada request
- Acesso apenas a dados autorizados

### Variáveis de Ambiente
- Secrets nunca commitados
- `.env.local` no `.gitignore`
- Validação de variáveis obrigatórias

## 📊 Fluxo de Dados

```
1. Usuário faz login
   ↓
2. GitHub OAuth retorna token
   ↓
3. NextAuth armazena token na sessão
   ↓
4. Usuário seleciona repositório e período
   ↓
5. Frontend chama API /analyze
   ↓
6. API usa GitHubAnalyzer com token
   ↓
7. GitHubAnalyzer busca commits do GitHub
   ↓
8. Calcula estatísticas e métricas
   ↓
9. Retorna dados para frontend
   ↓
10. Frontend renderiza gráficos e estatísticas
    ↓
11. Usuário pode exportar PDF
```

## 🚀 Performance

### Otimizações
- **Paginação:** Busca commits em lotes de 100
- **Lazy Loading:** Componentes carregados sob demanda
- **Memoization:** React.memo em componentes pesados
- **Code Splitting:** Next.js automático

### Caching (Futuro)
- PostgreSQL para cache de análises
- Redis para sessões
- CDN para assets estáticos

## 🧪 Testes (Futuro)

### Sugestões de Implementação
- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** Cypress
- **API Tests:** Supertest
- **E2E Tests:** Playwright

## 📈 Métricas Coletadas

### Estatísticas Básicas
- Total de commits
- Linhas adicionadas/removidas
- Arquivos modificados
- Tamanho médio do commit

### Análise Temporal
- Commits por dia
- Commits por hora
- Commits por dia da semana
- Horários mais produtivos

### Análise de Código
- Distribuição por linguagem
- Arquivos mais modificados
- Palavras-chave em mensagens
- Maior commit (por mudanças)

## 🔄 Ciclo de Vida

### Desenvolvimento
```bash
npm run dev    # Servidor de desenvolvimento
```

### Build
```bash
npm run build  # Build de produção
npm start      # Servidor de produção
```

### Lint
```bash
npm run lint   # ESLint
```

## 🌐 Deploy

### Plataformas Suportadas
- **Vercel** (Recomendado)
- **Netlify**
- **Railway**
- **AWS Amplify**
- **DigitalOcean App Platform**

### Requisitos de Deploy
1. Configurar variáveis de ambiente
2. Atualizar callback URL no GitHub OAuth
3. Configurar domínio customizado (opcional)
4. Habilitar HTTPS

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e GitHub API**
