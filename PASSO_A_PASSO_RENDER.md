# 📊 Passo a Passo: Hospedagem do Banco de Dados no Render

Este é um guia simplificado para hospedar o banco de dados PostgreSQL do Chatbot Militar no Render.

## 📋 Resumo dos Passos

1. Criar conta no Render (se ainda não tiver)
2. Criar banco de dados PostgreSQL no Render
3. Fazer upload do arquivo de backup
4. Restaurar o backup
5. Conectar o aplicativo ao banco de dados

## 🚀 Passo 1: Criar Conta no Render

1. Acesse [render.com](https://render.com/)
2. Clique em "Sign Up" e crie uma conta (pode usar GitHub para login)

## 🔄 Passo 2: Criar Banco de Dados PostgreSQL

1. No Dashboard do Render, clique em "New +"
2. Selecione "PostgreSQL"
3. Preencha os campos:
   - **Name**: `chatbot-militar-postgres`
   - **Database**: `chatbot_militar`
   - **User**: `chatbot_user`
   - **Region**: Escolha a mais próxima (geralmente US East)
   - **Plan**: Free
4. Clique em "Create Database"
5. Aguarde a criação do banco (pode levar alguns minutos)

## 📤 Passo 3: Fazer Upload do Backup

1. No Dashboard do Render, acesse o banco de dados criado
2. Clique na aba "Backups"
3. Clique em "Upload Backup"
4. Selecione o arquivo `postgres_export/render_import.dump` do seu computador
5. Aguarde o upload ser concluído

## 🔄 Passo 4: Restaurar o Backup

1. Após o upload, você verá o backup na lista
2. Clique em "Restore" ao lado do backup
3. Confirme a restauração
4. Aguarde a restauração ser concluída (pode levar alguns minutos)

## 🔌 Passo 5: Conectar o Aplicativo

1. No Dashboard do Render, acesse o banco de dados
2. Clique na aba "Connect"
3. Copie a "External Database URL"
4. No Dashboard do Render, acesse seu serviço web (ou crie um novo)
5. Vá para "Environment" e adicione a variável:
   - **Key**: `DATABASE_URL`
   - **Value**: Cole a URL copiada

## ✅ Verificação Final

1. Deploy seu aplicativo no Render (se ainda não fez)
2. Acesse os logs do serviço web para verificar se a conexão com o banco está funcionando
3. Teste o endpoint de saúde: `https://seu-app.onrender.com/api/health`

## 🔍 Problemas Comuns

- **Erro de conexão**: Verifique se a URL do banco está correta
- **Dados ausentes**: Verifique se a restauração foi concluída com sucesso
- **Aplicativo não inicia**: Verifique os logs para identificar o problema

---

Para instruções mais detalhadas, consulte o arquivo `BANCO_DADOS_RENDER.md`. 