# ⚡ Quick Start - GitHub Analytics

## 🎯 Início Rápido em 5 Minutos

### 1️⃣ Instalar Dependências (2 min)

Abra o PowerShell e execute:

```powershell
# Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Navegar para o projeto
cd C:\Users\Usuario\Desktop\git-report

# Instalar
npm install
```

### 2️⃣ Criar GitHub OAuth App (2 min)

1. Acesse: https://github.com/settings/developers
2. Clique em **"New OAuth App"**
3. Preencha:
   - **Application name:** GitHub Analytics
   - **Homepage URL:** http://localhost:3000
   - **Callback URL:** http://localhost:3000/api/auth/callback/github
4. Copie o **Client ID** e **Client Secret**

### 3️⃣ Configurar .env.local (1 min)

Crie o arquivo `.env.local` na raiz:

```env
GITHUB_CLIENT_ID=cole_aqui_seu_client_id
GITHUB_CLIENT_SECRET=cole_aqui_seu_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=qualquer_string_aleatoria_de_32_caracteres
```

### 4️⃣ Iniciar o Servidor

```powershell
npm run dev
```

### 5️⃣ Acessar

Abra: http://localhost:3000

---

## 🎉 Pronto!

Agora você pode:
1. Fazer login com GitHub
2. Selecionar um repositório
3. Escolher o período
4. Clicar em "Analisar"
5. Ver estatísticas e gráficos
6. Exportar PDF

---

## 📚 Documentação Completa

- **README.md** - Visão geral completa
- **INSTALL.md** - Guia detalhado de instalação
- **ARCHITECTURE.md** - Arquitetura do projeto
- **API.md** - Documentação da API
- **PROJECT_SUMMARY.md** - Resumo do projeto

---

## ❓ Problemas?

### Erro ao instalar
```powershell
# Limpar cache e tentar novamente
npm cache clean --force
npm install
```

### Erro de autenticação
- Verifique se o Client ID e Secret estão corretos
- Verifique se a Callback URL está correta

### Porta 3000 em uso
```powershell
# Usar outra porta
npm run dev -- -p 3001
```

---

**Desenvolvido com ❤️ - Aproveite!** 🚀
