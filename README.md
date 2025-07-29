# 🤖 Chatbot Militar - Sistema RAG Avançado

Sistema de chatbot especializado em leis, regulamentos e normas militares, utilizando Google Gemini e RAG (Retrieval-Augmented Generation) com funcionalidades avançadas de clusterização e histórico persistente.

## 🎯 Características

- **Tema Militar**: Interface com cores das fardas militares (verde, marrom, preto)
- **IA Avançada**: Integração com Google Gemini 1.5 Flash
- **Sistema RAG**: Busca inteligente em documentos PDF militares
- **Voz**: Suporte a entrada e saída por áudio
- **Mobile First**: Aplicativo React Native com Expo
- **Backend Robusto**: API Node.js com Express
- **Banco de Dados**: MongoDB Atlas para persistência

## 🚀 Funcionalidades Principais

### 📚 Sistema RAG Avançado
- **Processamento de PDFs**: Extração e chunking inteligente de documentos militares
- **Busca Semântica**: Utiliza Universal Sentence Encoder para embeddings de alta qualidade
- **Clusterização K-means**: Agrupamento automático de chunks por temas
- **Contexto Inteligente**: Busca os chunks mais relevantes para cada pergunta

### 💾 Histórico Persistente
- **Persistência no MongoDB**: Todas as perguntas e respostas são salvas no banco
- **Anti-duplicidade**: Detecta perguntas similares e reutiliza respostas existentes
- **Estatísticas Avançadas**: Conta uso, popularidade e análise de clusters
- **Limpeza Automática**: Remove histórico antigo e pouco usado
- **Sugestões Inteligentes**: Recomenda perguntas populares do mesmo tema

### 🎯 Funcionalidades de Sugestão
- **Detecção de Similaridade**: Identifica perguntas muito parecidas (threshold configurável)
- **Sugestões por Cluster**: Recomenda perguntas populares do mesmo tema
- **Contadores de Uso**: Rastreia quantas vezes cada pergunta foi feita
- **Metadados Ricos**: Armazena tempo de resposta, contexto encontrado, etc.

## 🎯 Arquitetura

```
chatbot-militar/
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor principal
│   ├── routes/            # Rotas da API
│   ├── services/          # Serviços (Gemini, RAG)
│   ├── models/            # Modelos MongoDB
│   └── config/            # Configurações
├── mobile/                # App React Native
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── screens/       # Telas do app
│   │   ├── services/      # Serviços de API
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Utilitários e tema
│   └── App.tsx           # Componente principal
└── uploads/              # Documentos PDF militares
    ├── regulamentos/     # Regulamentos militares
    ├── leis/            # Leis das forças armadas
    ├── manuais/         # Manuais de instrução
    └── outros/          # Outros documentos
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Android Studio (para desenvolvimento Android)
- Expo CLI
- Conta Google Cloud (para API Gemini)
- Conta MongoDB Atlas (para banco de dados)

### 1. Configuração do Backend

```bash
# Instalar dependências do backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com sua chave da API Gemini e MongoDB
```

### 2. Configuração do Mobile

```bash
# Entrar na pasta mobile
cd mobile

# Instalar dependências
npm install

# Instalar Expo CLI globalmente (se necessário)
npm install -g @expo/cli
```

### 3. Configuração da API Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API Key
3. Adicione a chave no arquivo `.env`:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```

### 4. Configuração do MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie um cluster gratuito
3. Configure usuário e rede
4. Obtenha a string de conexão
5. Adicione no arquivo `.env`:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatbot_militar
   ```

## 🏃‍♂️ Executando o Projeto

### Backend

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

### Mobile

```bash
cd mobile

# Iniciar o Expo
npm start

# Para Android
npm run android

# Para iOS
npm run ios
```

## 📱 Uso do Aplicativo

1. **Iniciar o Chat**: Abra o app e veja a mensagem de boas-vindas
2. **Enviar Mensagem**: Digite sua pergunta sobre leis militares
3. **Gravar Áudio**: Toque no botão de microfone para enviar áudio
4. **Ouvir Resposta**: Toque nas mensagens do bot para ouvir em voz alta

## 📄 Upload de Documentos

Para adicionar documentos militares ao sistema:

### Opção 1: Upload Manual (Recomendado)
1. Coloque os arquivos PDF na pasta `uploads/` organizados por categoria:
   ```
   uploads/
   ├── regulamentos/     # Regulamentos militares
   ├── leis/            # Leis das forças armadas  
   ├── manuais/         # Manuais de instrução
   └── outros/          # Outros documentos
   ```
2. O sistema RAG processará automaticamente na inicialização

### Opção 2: Upload via API
```bash
curl -X POST http://localhost:3000/api/upload/document \
  -F "document=@seu_documento.pdf"
```

### Opção 3: Upload via Interface Web
- Acesse a rota de upload no navegador
- Arraste e solte os arquivos PDF

### Verificar Processamento
```bash
# Verificar status
curl http://localhost:3000/api/rag/stats

# Verificar documentos
curl http://localhost:3000/api/upload/documents
```

## 🎨 Tema Militar

O aplicativo usa as seguintes cores das fardas militares:

- **Verde Militar Escuro**: `#2d5016`
- **Verde Militar Médio**: `#4a5d23`
- **Marrom Militar**: `#8b4513`
- **Preto Militar**: `#1a1a1a`
- **Cinza Escuro**: `#2a2a2a`

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=development

# Google Gemini
GEMINI_API_KEY=sua_chave_aqui

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatbot_militar

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# RAG
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
SIMILARITY_THRESHOLD=0.7

# Limpeza Automática
CLEAN_HISTORY_ON_START=false
```

### Personalização do RAG

Edite `server/services/ragService.js` para:
- Ajustar tamanho dos chunks
- Modificar algoritmo de busca
- Adicionar novos tipos de documento

## 🐛 Solução de Problemas

### Erro de Conexão
- Verifique se o backend está rodando
- Confirme a URL da API no arquivo `mobile/src/services/api.ts`

### Erro de Permissão de Áudio
- Verifique as permissões no Android/iOS
- Reinicie o aplicativo após conceder permissões

### Erro da API Gemini
- Verifique se a chave API está correta
- Confirme se a conta tem créditos disponíveis

### Documentos não Processados
- Verifique se são arquivos PDF válidos
- Confirme se estão na pasta `uploads/`
- Verifique os logs do servidor

## 📋 Próximos Passos

- [x] Implementar sistema RAG com MongoDB
- [x] Criar estrutura de uploads organizada
- [ ] Implementar autenticação militar
- [ ] Adicionar mais formatos de documento
- [ ] Melhorar algoritmo de busca RAG
- [ ] Implementar histórico de conversas
- [ ] Adicionar notificações push
- [ ] Criar dashboard administrativo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎖️ Suporte Militar

Para suporte técnico ou dúvidas sobre implementação militar, entre em contato com a equipe de desenvolvimento.

## 📊 API Endpoints

### Chat
- `POST /api/chat/message` - Enviar mensagem
- `POST /api/chat/audio` - Processar áudio
- `POST /api/chat/tts` - Text-to-Speech

### RAG e Histórico
- `GET /api/rag/stats` - Estatísticas dos documentos
- `GET /api/rag/history/stats` - Estatísticas do histórico
- `DELETE /api/rag/history/clean?daysOld=30` - Limpar histórico antigo
- `GET /api/rag/history/popular/:cluster` - Perguntas populares por cluster
- `POST /api/rag/history/similar` - Buscar perguntas similares

### Upload
- `POST /api/upload/document` - Upload de PDF
- `GET /api/upload/documents` - Listar documentos

## 🧪 Testando o Sistema

### Script de Teste Automático
```bash
# Testar funcionalidades do histórico
node test_history.js
```

### Testes Manuais
```bash
# 1. Verificar saúde do sistema
curl http://localhost:3000/api/health

# 2. Ver estatísticas do RAG
curl http://localhost:3000/api/rag/stats

# 3. Ver estatísticas do histórico
curl http://localhost:3000/api/rag/history/stats

# 4. Enviar mensagem de teste
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Qual é a penalidade para indisciplina militar?"}'
```

## 📈 Funcionalidades Avançadas

### Clusterização Inteligente
- **K-means automático**: Agrupa chunks por similaridade semântica
- **5 clusters padrão**: Configurável via código
- **Atribuição automática**: Cada pergunta é associada ao cluster mais relevante

### Sistema Anti-duplicidade
- **Threshold configurável**: 0.8 por padrão (muito similar)
- **Incremento automático**: Conta quantas vezes uma pergunta foi feita
- **Resposta instantânea**: Para perguntas muito similares

### Sugestões Contextuais
- **Por cluster**: Perguntas populares do mesmo tema
- **Por popularidade**: Baseado no número de vezes perguntado
- **Por recência**: Considera quando foi perguntado pela última vez

### Limpeza Inteligente
- **Automática**: Pode ser ativada na inicialização
- **Configurável**: Dias para manter histórico (padrão: 30)
- **Seletiva**: Mantém perguntas usadas mais de uma vez

## 🔄 Fluxo de Funcionamento

1. **Inicialização**: Carrega documentos, clusteriza chunks, carrega histórico
2. **Nova Pergunta**: Verifica similaridade com histórico existente
3. **Se Similar**: Retorna resposta existente + incrementa contador
4. **Se Nova**: Busca contexto RAG, gera resposta Gemini, salva no histórico
5. **Sugestões**: Recomenda perguntas populares do mesmo cluster
6. **Limpeza**: Remove histórico antigo automaticamente

## 🚀 Deploy

### Local
```bash
npm install
npm run dev
```

### Render (Cloud)
- Configurar variáveis de ambiente
- Deploy automático via GitHub
- MongoDB Atlas para banco de dados

## 📝 Próximos Passos

- [ ] Interface de administração para visualizar clusters
- [ ] Sistema de feedback para melhorar respostas
- [ ] Cache Redis para embeddings
- [ ] Autenticação de usuários militares
- [ ] Análise de sentimentos das perguntas
- [ ] Exportação de relatórios de uso

---

**Desenvolvido para as Forças Armadas** 🎖️ 