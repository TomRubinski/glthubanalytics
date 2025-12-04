# GitHub Analytics 📊

Um aplicativo web moderno e completo para analisar contribuições do GitHub e gerar relatórios detalhados com visualizações interativas.

![GitHub Analytics](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funcionalidades

### 🔐 Autenticação
- Login via OAuth do GitHub
- Acesso seguro a repositórios públicos e privados
- Gerenciamento de sessão com NextAuth

### 📊 Análise de Contribuições
- **Métricas Detalhadas:**
  - Total de commits no período
  - Linhas adicionadas vs removidas
  - Arquivos modificados (quais e quantas vezes)
  - Linguagens de programação mais utilizadas
  - Frequência de commits (por dia/semana)
  - Horários mais produtivos
  - Tamanho médio dos commits
  - Palavras-chave mais usadas nas mensagens de commit

### 📈 Visualizações Interativas
- **Gráfico de Linha:** Commits ao longo do tempo
- **Gráfico de Barras:** Linhas adicionadas/removidas
- **Gráfico de Pizza:** Distribuição por linguagem
- **Gráfico de Atividade:** Horários mais produtivos

### 📄 Relatórios
- Resumo executivo detalhado
- Estatísticas consolidadas
- Exportação em PDF com formatação profissional
- Highlights das principais mudanças

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js 14, React 18, TypeScript
- **Autenticação:** NextAuth.js com GitHub OAuth
- **API:** GitHub REST API via Octokit
- **Gráficos:** Recharts
- **Exportação:** jsPDF, html2canvas
- **Estilização:** CSS Modules com design system moderno
- **Data Handling:** date-fns

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- Conta no GitHub
- GitHub OAuth App criado

### Passo 1: Clonar o Repositório
```bash
git clone <repository-url>
cd git-report
```

### Passo 2: Instalar Dependências
```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# GitHub OAuth App Configuration
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_secreta_aqui

# Database (Opcional - para cache)
DATABASE_URL=postgresql://user:password@localhost:5432/gitreport

# OpenAI API (Opcional - para resumos com IA)
OPENAI_API_KEY=sua_openai_api_key
```

### Passo 4: Criar GitHub OAuth App

1. Acesse: https://github.com/settings/developers
2. Clique em "New OAuth App"
3. Preencha:
   - **Application name:** GitHub Analytics
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:3000/api/auth/callback/github
4. Copie o **Client ID** e **Client Secret** para o `.env.local`

### Passo 5: Gerar NEXTAUTH_SECRET

```bash
# No terminal, execute:
openssl rand -base64 32
```

Copie o resultado para `NEXTAUTH_SECRET` no `.env.local`

## 🎯 Como Usar

### Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

### Fluxo de Uso

1. **Login:** Clique em "Entrar com GitHub" na página inicial
2. **Autorize:** Permita o acesso aos seus repositórios
3. **Selecione:** Escolha o repositório que deseja analisar
4. **Configure:** 
   - Selecione a branch (opcional)
   - Defina a data inicial
   - Defina a data final
5. **Analise:** Clique em "Analisar" e aguarde o processamento
6. **Visualize:** Explore as estatísticas e gráficos gerados
7. **Exporte:** Clique em "Exportar PDF" para salvar o relatório

## 🎨 Design

O aplicativo utiliza um design system moderno com:
- **Tema Dark Premium** com paleta de cores vibrantes
- **Glassmorphism** para efeitos de vidro fosco
- **Animações Suaves** para melhor UX
- **Gradientes Dinâmicos** para destaque visual
- **Responsivo** para todos os dispositivos

## 📁 Estrutura do Projeto

```
git-report/
├── components/          # Componentes React reutilizáveis
│   ├── LoginCard.tsx
│   ├── StatsGrid.tsx
│   └── Charts.tsx
├── lib/                # Utilitários e lógica de negócio
│   ├── github-analyzer.ts
│   ├── pdf-generator.ts
│   └── chart-utils.ts
├── pages/              # Páginas Next.js
│   ├── api/           # API Routes
│   ├── index.tsx      # Página inicial
│   └── dashboard.tsx  # Dashboard principal
├── styles/            # Estilos globais
│   └── globals.css
├── types/             # Definições TypeScript
│   └── index.ts
└── package.json
```

## 🔒 Segurança

- Todas as chamadas à API do GitHub são autenticadas
- Tokens de acesso são armazenados de forma segura via NextAuth
- Variáveis sensíveis são mantidas em `.env.local`
- Apenas informações necessárias são solicitadas ao GitHub

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente
4. Atualize a **Authorization callback URL** no GitHub OAuth App para:
   `https://seu-dominio.vercel.app/api/auth/callback/github`

### Outras Plataformas

O aplicativo pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📝 Licença

Este projeto está sob a licença MIT.

## 🙏 Agradecimentos

- GitHub API pela excelente documentação
- Recharts pela biblioteca de gráficos
- Next.js pela framework incrível
- Comunidade open source

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
