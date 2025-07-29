const { Client } = require('pg');
<<<<<<< HEAD

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'chatbot_militar',
  password: 'garcia',
  port: 5432,
});

client.connect();
=======
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Usar a URL de conexão do Render ou configuração local como fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:garcia@localhost:5432/chatbot_militar';

// Configuração de SSL baseada no ambiente
const isRenderDb = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com');
const sslConfig = isRenderDb ? { rejectUnauthorized: false } : false;

// Criar cliente com configurações apropriadas
const client = new Client({
  connectionString,
  ssl: sslConfig
});

// Conectar ao banco de dados
client.connect()
  .then(() => {
    console.log('📊 Conectado ao PostgreSQL no ' + (isRenderDb ? 'Render' : 'ambiente local'));
    console.log(`🔒 Conexão SSL: ${sslConfig ? 'Ativada' : 'Desativada'}`);
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err);
    console.error('⚠️ String de conexão (parcial): ' + connectionString.split('@')[1]);
  });
>>>>>>> 2558089a4cf88e8b76387127c4ed9dc0cfdf7d6a

module.exports = client; 