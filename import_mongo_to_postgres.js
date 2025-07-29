/**
 * Script para exportar o banco de dados PostgreSQL local para um formato compatível com o Render
 * 
 * Este script:
 * 1. Conecta ao banco PostgreSQL local
 * 2. Exporta as tabelas para arquivos SQL
 * 3. Gera um arquivo de dump completo que pode ser importado no Render
 * 
 * Uso: node export_postgres_for_render.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

// Configurações do banco de dados
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'chatbot_militar',
  user: 'postgres',
  password: 'garcia' // Substitua pela sua senha
};

// Diretório para salvar os arquivos
const EXPORT_DIR = path.join(__dirname, 'postgres_export');

// Criar diretório de exportação se não existir
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// Função principal
async function exportPostgresForRender() {
  try {
    console.log('🚀 Iniciando exportação do PostgreSQL para Render...');
    
    // Exportar schema (estrutura do banco)
    console.log('📊 Exportando schema...');
    await execPromise(`pg_dump --host=${DB_CONFIG.host} --port=${DB_CONFIG.port} --username=${DB_CONFIG.user} --dbname=${DB_CONFIG.database} --schema-only --no-owner --no-privileges --file=${path.join(EXPORT_DIR, 'schema.sql')}`);
    
    // Exportar dados
    console.log('📋 Exportando dados...');
    await execPromise(`pg_dump --host=${DB_CONFIG.host} --port=${DB_CONFIG.port} --username=${DB_CONFIG.user} --dbname=${DB_CONFIG.database} --data-only --no-owner --no-privileges --file=${path.join(EXPORT_DIR, 'data.sql')}`);
    
    // Criar dump completo
    console.log('📦 Criando dump completo...');
    await execPromise(`pg_dump --host=${DB_CONFIG.host} --port=${DB_CONFIG.port} --username=${DB_CONFIG.user} --dbname=${DB_CONFIG.database} --no-owner --no-privileges --format=custom --file=${path.join(EXPORT_DIR, 'render_import.dump')}`);
    
    console.log(`\n✅ Exportação concluída com sucesso!`);
    console.log(`\n📁 Arquivos exportados para: ${EXPORT_DIR}`);
    console.log(`\n📝 Instruções para importar no Render:`);
    console.log(`1. Acesse o Dashboard do Render`);
    console.log(`2. Vá para seu banco de dados PostgreSQL`);
    console.log(`3. Clique em "Backups" e depois em "Upload Backup"`);
    console.log(`4. Faça upload do arquivo: render_import.dump`);
    console.log(`5. Clique em "Restore" para restaurar o backup`);
    
  } catch (error) {
    console.error('❌ Erro durante a exportação:', error);
  }
}

// Executar função principal
exportPostgresForRender().catch(console.error); 