const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Carregar variáveis de ambiente
dotenv.config();

// Importar client PostgreSQL (já conecta automaticamente)
const client = require('./services/postgresService');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir frontend web (React build)
const webBuildPath = path.join(__dirname, '../web/dist');
app.use(express.static(webBuildPath));
// Qualquer rota não-API retorna o index.html do frontend
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(webBuildPath, 'index.html'));
});

// Importar rotas
const chatRoutes = require('./routes/chat');
const uploadRoutes = require('./routes/upload');
const ragRoutes = require('./routes/rag');

// Usar rotas
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rag', ragRoutes);

// Rota de teste
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexão com o banco de dados
    const dbResult = await client.query('SELECT NOW() as time, current_database() as database, version() as version');
    const isConnected = !!dbResult.rows[0];
    
    // Extrair informações do host a partir da string de conexão
    const dbHost = process.env.DATABASE_URL 
      ? 'Render PostgreSQL' 
      : 'PostgreSQL Local';
    
    // Verificar número de documentos e fragmentos
    const docsCountResult = await client.query('SELECT COUNT(*) as count FROM documentos');
    const chunksCountResult = await client.query('SELECT COUNT(*) as count FROM fragmentos_documento');
    
    res.json({ 
      status: 'OK', 
      message: 'Chatbot Militar funcionando!',
      timestamp: new Date().toISOString(),
      database: {
        connected: isConnected,
        health: isConnected ? 'OK' : 'ERROR',
        host: dbHost,
        timestamp: isConnected ? dbResult.rows[0].time : null,
        name: isConnected ? dbResult.rows[0].database : null,
        version: isConnected ? dbResult.rows[0].version : null,
        stats: {
          documentos: parseInt(docsCountResult.rows[0].count),
          fragmentos: parseInt(chunksCountResult.rows[0].count)
        }
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()) + ' segundos'
    });
  } catch (error) {
    console.error('Erro na rota de health check:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro ao verificar saúde do sistema',
      error: error.message,
      database: {
        connected: false,
        health: 'ERROR'
      }
    });
  }
});

// Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-chat', (data) => {
    socket.join('military-chat');
    console.log(`Usuário ${data.userId || 'anônimo'} entrou no chat militar`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

// Inicializar servidor
async function startServer() {
  try {
    // Inicializar sistema RAG
    const ragService = require('./services/ragService');
    await ragService.loadDocuments();

    // Limpar histórico antigo automaticamente (opcional)
    if (process.env.CLEAN_HISTORY_ON_START === 'true') {
      console.log('🧹 Limpando histórico antigo...');
      await ragService.cleanOldHistory(30); // 30 dias
    }

    server.listen(PORT, () => {
      console.log(`🚀 Servidor do Chatbot Militar rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log('🗄️ Banco de dados: PostgreSQL conectado');
      console.log(`📊 Sistema RAG: ${ragService.documents.length} chunks carregados`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Recebido SIGTERM, encerrando servidor...');
  // No banco de dados PostgreSQL, não há desconexão explícita a ser feita aqui
  // A conexão é gerenciada pelo client do PostgreSQL
  server.close(() => {
    console.log('✅ Servidor encerrado');
    process.exit(0);
  });
});

startServer();

module.exports = { app, io }; 