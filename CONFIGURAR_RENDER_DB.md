# 🔄 Configuração do Banco de Dados do Render

Este guia explica como configurar o projeto para usar o banco de dados PostgreSQL hospedado no Render.

## 📋 Passo 1: Criar arquivo .env

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Google Gemini API
GEMINI_API_KEY=sua_chave_api_gemini_aqui

# Configurações do Banco de Dados PostgreSQL no Render
DATABASE_URL=postgresql://chatbd_9y0m_user:0SXNxyRLutPmuHpcAViaLOsvD4QxxzEn@dpg-d20mfpjipnbc73dejim0-a.frankfurt-postgres.render.com/chatbd_9y0m

# JWT Secret (para futuras implementações de autenticação)
JWT_SECRET=seu_jwt_secret_aqui

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Configurações do RAG
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
SIMILARITY_THRESHOLD=0.7

# Configurações de Limpeza Automática
CLEAN_HISTORY_ON_START=false
```

> ⚠️ **Importante**: Substitua `sua_chave_api_gemini_aqui` pela sua chave API do Google Gemini.

## 📋 Passo 2: Verificar a conexão

Para verificar se a conexão com o banco de dados do Render está funcionando:

1. Inicie o servidor:
   ```
   npm start
   ```

2. Acesse a rota de health check:
   ```
   http://localhost:3000/api/health
   ```

3. Verifique se a seção `database` mostra:
   ```json
   "database": {
     "connected": true,
     "health": "OK",
     "host": "Render PostgreSQL",
     "timestamp": "2023-07-23T12:34:56.789Z"
   }
   ```

## 🔍 Solução de problemas

### Erro de SSL

Se você encontrar erros relacionados a SSL, pode ser necessário modificar o arquivo `server/services/postgresService.js` para:

```javascript
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});
```

### Erro de conexão

Se não conseguir conectar ao banco de dados, verifique:

1. Se a string de conexão está correta
2. Se o IP do seu computador está na lista de IPs permitidos no Render
3. Se o banco de dados está ativo no Render

## 📊 Comandos úteis para PostgreSQL

### Verificar tabelas
```sql
\dt
```

### Verificar contagem de registros
```sql
SELECT COUNT(*) FROM documentos;
SELECT COUNT(*) FROM fragmentos_documento;
```

### Verificar dados específicos
```sql
SELECT * FROM documentos LIMIT 5;
``` 