const { Client } = require('pg');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Usar a URL de conexão do Render ou configuração local como fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:garcia@localhost:5432/chatbot_militar';

const client = new Client({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

client.connect().then(() => {
  console.log('📊 Conectado ao PostgreSQL no ' + (process.env.DATABASE_URL ? 'Render' : 'ambiente local'));
}).catch(err => {
  console.error('❌ Erro ao conectar ao PostgreSQL:', err);
});

module.exports = client; 