# Exemplos de Uso da API - GitHub Analytics

## 📚 Guia de Referência da API

### Autenticação

Todas as requisições à API requerem autenticação via NextAuth. O token de acesso do GitHub é gerenciado automaticamente pela sessão.

---

## 🔌 Endpoints Disponíveis

### 1. Analisar Repositório

**Endpoint:** `POST /api/analyze`

**Descrição:** Analisa um repositório GitHub e retorna estatísticas detalhadas.

**Corpo da Requisição:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "author": "seu-usuario-github",
  "since": "2024-01-01T00:00:00Z",
  "until": "2024-12-31T23:59:59Z",
  "branch": "main"
}
```

**Resposta de Sucesso (200):**
```json
{
  "totalCommits": 150,
  "totalAdditions": 5420,
  "totalDeletions": 2130,
  "netChanges": 3290,
  "filesModified": 87,
  "uniqueFiles": ["src/App.tsx", "README.md", ...],
  "languageDistribution": {
    "TypeScript": 3200,
    "JavaScript": 1800,
    "CSS": 420
  },
  "commitsByDay": {
    "2024-01-15": 5,
    "2024-01-16": 3,
    ...
  },
  "commitsByHour": {
    "9": 12,
    "10": 15,
    "14": 20,
    ...
  },
  "commitsByWeekday": {
    "segunda-feira": 25,
    "terça-feira": 30,
    ...
  },
  "averageCommitSize": 50.13,
  "largestCommit": {
    "sha": "abc123...",
    "message": "Major refactor of authentication system",
    "changes": 450
  },
  "commitKeywords": {
    "fix": 45,
    "feat": 32,
    "update": 28,
    ...
  }
}
```

**Exemplo de Uso (Frontend):**
```typescript
const analyzeRepository = async () => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: 'facebook',
      repo: 'react',
      author: 'gaearon',
      since: '2024-01-01T00:00:00Z',
      until: '2024-12-31T23:59:59Z',
      branch: 'main'
    })
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  const stats = await response.json();
  console.log('Total commits:', stats.totalCommits);
};
```

---

### 2. Listar Repositórios

**Endpoint:** `GET /api/repositories?username={username}`

**Descrição:** Lista todos os repositórios de um usuário GitHub.

**Parâmetros:**
- `username` (string, obrigatório): Nome de usuário do GitHub

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 123456,
    "name": "my-project",
    "full_name": "usuario/my-project",
    "description": "Um projeto incrível",
    "private": false,
    "owner": {
      "login": "usuario",
      "avatar_url": "https://avatars.githubusercontent.com/..."
    },
    "html_url": "https://github.com/usuario/my-project",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-12-01T00:00:00Z",
    "pushed_at": "2024-12-01T00:00:00Z",
    "size": 1024,
    "stargazers_count": 42,
    "language": "TypeScript",
    "default_branch": "main"
  },
  ...
]
```

**Exemplo de Uso:**
```typescript
const fetchRepositories = async (username: string) => {
  const response = await fetch(`/api/repositories?username=${username}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }

  const repos = await response.json();
  return repos;
};
```

---

### 3. Listar Branches

**Endpoint:** `GET /api/branches?owner={owner}&repo={repo}`

**Descrição:** Lista todas as branches de um repositório.

**Parâmetros:**
- `owner` (string, obrigatório): Proprietário do repositório
- `repo` (string, obrigatório): Nome do repositório

**Resposta de Sucesso (200):**
```json
[
  "main",
  "develop",
  "feature/new-feature",
  "hotfix/critical-bug"
]
```

**Exemplo de Uso:**
```typescript
const fetchBranches = async (owner: string, repo: string) => {
  const response = await fetch(`/api/branches?owner=${owner}&repo=${repo}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch branches');
  }

  const branches = await response.json();
  return branches;
};
```

---

### 4. Obter Timeline

**Endpoint:** `POST /api/timeline`

**Descrição:** Gera uma timeline de commits agrupados por data.

**Corpo da Requisição:**
```json
{
  "owner": "facebook",
  "repo": "react",
  "author": "gaearon",
  "since": "2024-01-01T00:00:00Z",
  "until": "2024-12-31T23:59:59Z",
  "branch": "main"
}
```

**Resposta de Sucesso (200):**
```json
[
  {
    "date": "2024-12-01",
    "commits": [
      {
        "sha": "abc123d",
        "message": "Fix critical bug in authentication",
        "additions": 45,
        "deletions": 12,
        "files": 3
      },
      {
        "sha": "def456e",
        "message": "Add new feature for user profiles",
        "additions": 120,
        "deletions": 5,
        "files": 8
      }
    ]
  },
  {
    "date": "2024-11-30",
    "commits": [...]
  }
]
```

**Exemplo de Uso:**
```typescript
const fetchTimeline = async () => {
  const response = await fetch('/api/timeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      owner: 'facebook',
      repo: 'react',
      author: 'gaearon',
      since: '2024-01-01T00:00:00Z',
      until: '2024-12-31T23:59:59Z',
      branch: 'main'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch timeline');
  }

  const timeline = await response.json();
  return timeline;
};
```

---

## 🔒 Autenticação

### NextAuth Session

Todas as APIs verificam a sessão do usuário:

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Processar requisição...
}
```

### GitHub Access Token

O token de acesso do GitHub é armazenado na sessão e usado automaticamente:

```typescript
const analyzer = new GitHubAnalyzer(session.accessToken);
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

- **200:** Sucesso
- **400:** Parâmetros inválidos ou ausentes
- **401:** Não autenticado
- **405:** Método HTTP não permitido
- **500:** Erro interno do servidor

### Formato de Erro

```json
{
  "error": "Mensagem de erro descritiva"
}
```

### Exemplo de Tratamento:

```typescript
try {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Request failed');
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Mostrar mensagem de erro ao usuário
}
```

---

## 📊 Limites e Considerações

### Rate Limiting do GitHub

A API do GitHub tem limites de taxa:
- **Autenticado:** 5.000 requisições/hora
- **Não autenticado:** 60 requisições/hora

### Paginação

Commits são buscados em lotes de 100. Para repositórios com muitos commits, a análise pode levar alguns segundos.

### Timeout

Requisições longas podem exceder o timeout. Considere:
- Reduzir o período de análise
- Implementar cache no backend
- Usar webhooks para análises assíncronas

---

## 🧪 Testando a API

### Usando cURL

```bash
# Listar repositórios
curl -X GET "http://localhost:3000/api/repositories?username=seu-usuario" \
  -H "Cookie: next-auth.session-token=seu-token"

# Analisar repositório
curl -X POST "http://localhost:3000/api/analyze" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=seu-token" \
  -d '{
    "owner": "facebook",
    "repo": "react",
    "author": "gaearon",
    "since": "2024-01-01T00:00:00Z",
    "until": "2024-12-31T23:59:59Z"
  }'
```

### Usando Postman

1. Importe a coleção de endpoints
2. Configure a autenticação (Cookie)
3. Execute as requisições

### Usando Thunder Client (VS Code)

1. Instale a extensão Thunder Client
2. Crie uma nova requisição
3. Configure headers e body
4. Envie a requisição

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Cache de Análises**
   - Armazenar resultados em PostgreSQL
   - Evitar análises duplicadas
   - Melhorar performance

2. **Análise Assíncrona**
   - Queue de jobs (Bull/BullMQ)
   - Notificações em tempo real (WebSockets)
   - Status de progresso

3. **Webhooks**
   - Análise automática em push
   - Integração com CI/CD
   - Notificações por email

4. **API Pública**
   - Rate limiting customizado
   - API keys para desenvolvedores
   - Documentação OpenAPI/Swagger

---

**Desenvolvido com ❤️ usando Next.js e GitHub API**
