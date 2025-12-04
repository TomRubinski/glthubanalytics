# Guia de Instalação Rápida - GitHub Analytics

## 🚀 Início Rápido

### 1. Instalar Dependências

Devido às restrições de execução de scripts do PowerShell, você precisará executar os comandos manualmente.

Abra o PowerShell como Administrador e execute:

```powershell
# Permitir execução de scripts (temporariamente)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Navegar até o diretório do projeto
cd C:\Users\Usuario\Desktop\git-report

# Instalar dependências
npm install
```

### 2. Configurar GitHub OAuth App

1. Acesse: https://github.com/settings/developers
2. Clique em **"New OAuth App"**
3. Preencha os campos:
   - **Application name:** `GitHub Analytics`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Clique em **"Register application"**
5. Copie o **Client ID**
6. Clique em **"Generate a new client secret"** e copie o **Client Secret**

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# GitHub OAuth (obrigatório)
GITHUB_CLIENT_ID=cole_seu_client_id_aqui
GITHUB_CLIENT_SECRET=cole_seu_client_secret_aqui

# NextAuth (obrigatório)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=cole_uma_string_aleatoria_aqui

# Database (opcional)
# DATABASE_URL=postgresql://user:password@localhost:5432/gitreport

# OpenAI (opcional - para resumos com IA)
# OPENAI_API_KEY=sua_openai_api_key
```

**Para gerar o NEXTAUTH_SECRET:**

No PowerShell, execute:
```powershell
# Gerar uma string aleatória segura
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Ou use qualquer string aleatória de pelo menos 32 caracteres.

### 4. Iniciar o Servidor de Desenvolvimento

```powershell
npm run dev
```

Acesse: http://localhost:3000

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] GitHub OAuth App criado
- [ ] Arquivo `.env.local` configurado com:
  - [ ] GITHUB_CLIENT_ID
  - [ ] GITHUB_CLIENT_SECRET
  - [ ] NEXTAUTH_URL
  - [ ] NEXTAUTH_SECRET
- [ ] Servidor rodando (`npm run dev`)

## 🎯 Próximos Passos

1. Acesse http://localhost:3000
2. Clique em "Entrar com GitHub"
3. Autorize o aplicativo
4. Selecione um repositório
5. Configure o período de análise
6. Clique em "Analisar"

## 🐛 Problemas Comuns

### Erro: "Cannot find module"
**Solução:** Execute `npm install` novamente

### Erro: "Unauthorized" ao fazer login
**Solução:** Verifique se o GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET estão corretos no `.env.local`

### Erro: "Invalid callback URL"
**Solução:** Verifique se a callback URL no GitHub OAuth App está configurada como `http://localhost:3000/api/auth/callback/github`

### Erro de PowerShell ao executar npm
**Solução:** Execute `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` antes de rodar os comandos npm

## 📞 Suporte

Se encontrar problemas, verifique:
1. Todas as variáveis de ambiente estão configuradas
2. O GitHub OAuth App está configurado corretamente
3. As dependências foram instaladas com sucesso
4. A porta 3000 não está sendo usada por outro aplicativo

## 🚀 Deploy em Produção

Para fazer deploy em produção (Vercel, Netlify, etc.):

1. Configure as mesmas variáveis de ambiente na plataforma
2. Atualize a **Authorization callback URL** no GitHub OAuth App para:
   `https://seu-dominio.com/api/auth/callback/github`
3. Atualize `NEXTAUTH_URL` para `https://seu-dominio.com`

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
