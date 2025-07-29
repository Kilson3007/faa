# 🚀 Deploy no Render - Chatbot Militar

## 📋 Pré-requisitos

1. **Conta no Render** (gratuita)
2. **Conta no MongoDB Atlas** (gratuita)
3. **Chave da API Gemini**
4. **Repositório Git** (GitHub, GitLab, etc.)

## 🗄️ Configuração do MongoDB Atlas

### 1. Criar Cluster Gratuito
1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (M0 - Free)
4. Escolha a região mais próxima

### 2. Configurar Acesso
1. Em "Database Access", crie um usuário:
   - Username: `chatbot_user`
   - Password: `senha_segura_aqui`
   - Role: `Read and write to any database`

2. Em "Network Access", adicione IP:
   - `0.0.0.0/0` (para permitir acesso de qualquer lugar)

### 3. Obter String de Conexão
1. Clique em "Connect"
2. Escolha "Connect your application"
3. Copie a string de conexão:
   ```
   mongodb+srv://chatbot_user:senha_segura_aqui@cluster0.xxxxx.mongodb.net/chatbot_militar?retryWrites=true&w=majority
   ```

## 🔑 Configuração da API Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Copie a chave gerada

## 🚀 Deploy no Render

### Opção 1: Deploy Automático (Recomendado)

1. **Conectar Repositório**
   - Acesse [Render Dashboard](https://dashboard.render.com)
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório Git

2. **Configurar Serviço**
   - **Name**: `chatbot-militar-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

3. **Configurar Variáveis de Ambiente**
   ```
   NODE_ENV=production
   PORT=10000
   GEMINI_API_KEY=sua_chave_gemini_aqui
   MONGODB_URI=mongodb+srv://chatbot_user:senha@cluster0.xxxxx.mongodb.net/chatbot_militar?retryWrites=true&w=majority
   JWT_SECRET=seu_jwt_secret_aqui
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=10485760
   CHUNK_SIZE=1000
   CHUNK_OVERLAP=200
   ```

4. **Configurar Health Check**
   - **Health Check Path**: `/api/health`

### Opção 2: Deploy Manual

1. **Criar Serviço Web**
   ```bash
   # No Render Dashboard
   New + → Web Service → Build and deploy from a Git repository
   ```

2. **Configurar Build**
   - **Repository**: Seu repositório Git
   - **Branch**: `main`
   - **Root Directory**: `/` (raiz do projeto)

3. **Configurar Runtime**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## 🔧 Configurações Avançadas

### Variáveis de Ambiente no Render

```env
# Ambiente
NODE_ENV=production
PORT=10000

# APIs
GEMINI_API_KEY=sua_chave_aqui

# Banco de Dados
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Segurança
JWT_SECRET=seu_secret_aqui

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# RAG
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

### Configuração de Domínio

1. No Render Dashboard, vá em "Settings"
2. Em "Custom Domains", adicione seu domínio
3. Configure DNS conforme instruções

## 📱 Atualizar App Mobile

Após o deploy, atualize a URL da API no app mobile:

```typescript
// mobile/src/services/api.ts
const API_BASE_URL = 'https://seu-app.onrender.com/api';
```

## 🧪 Testar o Deploy

1. **Verificar Health Check**
   ```bash
   curl https://seu-app.onrender.com/api/health
   ```

2. **Testar Chat**
   ```bash
   curl -X POST https://seu-app.onrender.com/api/chat/message \
     -H "Content-Type: application/json" \
     -d '{"message": "Olá, como funciona o regulamento militar?"}'
   ```

3. **Verificar Banco de Dados**
   - Acesse MongoDB Atlas
   - Verifique se as coleções foram criadas

## 🔍 Monitoramento

### Logs no Render
- Dashboard → Seu Serviço → Logs
- Monitore erros e performance

### Métricas do MongoDB
- Atlas → Metrics
- Monitore conexões e queries

### Health Check
- Endpoint: `/api/health`
- Verifica status do servidor e banco

## 🚨 Troubleshooting

### Erro de Conexão com MongoDB
```bash
# Verificar string de conexão
# Verificar Network Access no Atlas
# Verificar credenciais
```

### Erro da API Gemini
```bash
# Verificar chave da API
# Verificar créditos disponíveis
# Verificar região da API
```

### App Mobile não Conecta
```bash
# Verificar URL da API
# Verificar CORS
# Verificar certificado SSL
```

## 📊 Custos

### Render (Gratuito)
- **Web Service**: 750 horas/mês
- **Database**: 90 dias grátis
- **Bandwidth**: 100GB/mês

### MongoDB Atlas (Gratuito)
- **Storage**: 512MB
- **RAM**: 0.5GB
- **Conexões**: 500

### Google Gemini
- **Gratuito**: 15 requests/minuto
- **Pago**: $0.00025 / 1K characters

## 🔄 Atualizações

### Deploy Automático
- Push para `main` branch
- Render faz deploy automático

### Deploy Manual
- Render Dashboard → Manual Deploy

## 📞 Suporte

- **Render**: [docs.render.com](https://docs.render.com)
- **MongoDB**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Google AI**: [ai.google.dev](https://ai.google.dev)

---

**Deploy configurado para produção militar** 🎖️ 