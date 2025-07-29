# 📊 Exportação e Importação do Banco de Dados PostgreSQL para o Render

Este guia explica como exportar seu banco de dados PostgreSQL local e importá-lo no serviço de banco de dados PostgreSQL do Render.

## 🚀 Passo 1: Exportar o Banco de Dados Local

### Opção 1: Usando o Script Node.js (Recomendado)

1. **Execute o script de exportação**:
   ```bash
   node export_postgres_for_render.js
   ```

   Este script irá:
   - Exportar o schema do banco (estrutura)
   - Exportar os dados
   - Criar um arquivo de dump completo no formato compatível com o Render

2. **Verifique os arquivos gerados**:
   ```
   postgres_export/
   ├── schema.sql        # Apenas a estrutura do banco (arquivo de texto)
   ├── data.sql          # Apenas os dados (arquivo de texto)
   └── render_import.dump # Dump completo para importação (arquivo binário)
   ```

   > ℹ️ **Nota**: O arquivo `render_import.dump` é um arquivo binário e não pode ser visualizado em editores de texto comuns. Isso é normal e esperado. Este arquivo deve ser usado diretamente para upload no Render.

### Opção 2: Usando o pg_dump Diretamente

Se preferir usar o comando `pg_dump` diretamente:

```bash
# Se o caminho não contém espaços:
pg_dump --host=localhost --port=5432 --username=postgres --dbname=chatbot_militar --no-owner --no-privileges --format=custom --file=render_import.dump

# Se o caminho contém espaços (Windows):
pg_dump --host=localhost --port=5432 --username=postgres --dbname=chatbot_militar --no-owner --no-privileges --format=custom --file="C:\Caminho Com Espacos\render_import.dump"
```

> ⚠️ **Nota importante**: Se o caminho do arquivo contiver espaços, certifique-se de colocar o caminho entre aspas duplas para evitar erros como "too many command-line arguments".

## 🔄 Passo 2: Importar no Render

### Configuração Inicial do Banco no Render

1. **Acesse o [Dashboard do Render](https://dashboard.render.com)**

2. **Crie um novo banco de dados PostgreSQL**:
   - Clique em "New +" → "PostgreSQL"
   - Preencha:
     - **Name**: `chatbot-militar-postgres`
     - **Database**: `chatbot_militar`
     - **User**: `chatbot_user`
     - **Region**: Escolha a mais próxima
     - **Plan**: Free (ou outro plano se necessário)

3. **Aguarde a criação do banco de dados**

### Importação do Dump

1. **Acesse seu banco de dados no Render**:
   - Vá para "Dashboard" → "PostgreSQL" → Seu banco de dados

2. **Faça upload do backup**:
   - Clique na aba "Backups"
   - Clique em "Upload Backup"
   - Selecione o arquivo `render_import.dump`
   - Clique em "Upload"

3. **Restaure o backup**:
   - Após o upload, clique em "Restore" ao lado do backup
   - Confirme a restauração

4. **Verifique a importação**:
   - Clique na aba "Connect"
   - Use o "External Database URL" para conectar-se ao banco e verificar os dados

## 🔌 Passo 3: Conectar o Aplicativo ao Banco de Dados

### Atualizar Configurações no Render.yaml

O arquivo `render.yaml` já foi configurado para usar o banco de dados PostgreSQL:

```yaml
services:
  - type: web
    name: chatbot-militar-api
    env: node
    plan: free
    # ... outras configurações ...
    envVars:
      # ... outras variáveis ...
      - key: DATABASE_URL
        fromDatabase:
          name: chatbot-militar-postgres
          property: connectionString
```

### Verificar a Conexão

Após o deploy, verifique se o aplicativo está conectando corretamente ao banco de dados:

1. **Acesse os logs do serviço web**:
   - Dashboard → Web Service → Logs
   - Procure por mensagens de conexão com o banco de dados

2. **Teste o endpoint de saúde**:
   ```bash
   curl https://seu-app.onrender.com/api/health
   ```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Erro "too many command-line arguments"**:
   - Este erro ocorre quando há espaços nos caminhos dos arquivos
   - Solução: Coloque o caminho completo entre aspas duplas
   ```bash
   pg_dump ... --file="C:\Caminho Com Espacos\arquivo.dump"
   ```

2. **Não é possível abrir o arquivo render_import.dump no editor de texto**:
   - Isso é normal. O arquivo `.dump` gerado com a opção `--format=custom` é um arquivo binário
   - Este formato é projetado para ser usado apenas pelo utilitário `pg_restore` ou pelo Render
   - Não tente visualizar ou editar este arquivo em um editor de texto

3. **Erro de permissão durante a importação**:
   - Certifique-se de que o dump foi criado com `--no-owner --no-privileges`

4. **Erro de conexão após importação**:
   - Verifique se as credenciais estão corretas
   - Verifique se o IP do seu serviço web está na lista de IPs permitidos

5. **Dados ausentes após importação**:
   - Verifique se o dump contém dados (não apenas schema)
   - Verifique se a restauração foi concluída sem erros

### Comandos Úteis

**Verificar tabelas no PostgreSQL do Render**:
```sql
\dt
```

**Verificar contagem de registros**:
```sql
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM document_chunks;
```

## 📝 Notas Importantes

1. **Backup Regular**: Configure backups automáticos no Render para evitar perda de dados

2. **Limites do Plano Free**:
   - 1GB de armazenamento
   - Conexões limitadas
   - Sem alta disponibilidade

3. **Migração para Plano Pago**: Se precisar de mais recursos, considere fazer upgrade para um plano pago

---

**Documentação Adicional**:
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [PostgreSQL Backup & Restore](https://www.postgresql.org/docs/current/backup.html) 