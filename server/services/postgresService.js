const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'chatbot_militar',
  password: 'garcia',
  port: 5432,
});

client.connect();

module.exports = client; 