const path = require('path');
const fs = require('fs').promises;
const ragService = require('../services/ragService');

async function ingestAllUploads() {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const contentMdPath = path.join(__dirname, '../../content.md');
  // Processar content.md se existir
  try {
    const fs = require('fs');
    if (fs.existsSync(contentMdPath)) {
      console.log(`Processando: ${contentMdPath}`);
      await ragService.processMarkdown(contentMdPath, 'ingest-script');
      console.log(`✅ Indexado: ${contentMdPath}`);
      // Regenerar artigos_content.json para que RAG busque conteúdo atualizado
      try {
        const parseModule = require('../../import_mongo_to_postgres');
        if (typeof parseModule.parseContentMd === 'function') {
          const artigos = parseModule.parseContentMd(contentMdPath);
          const jsonPath = path.join(__dirname, '../../artigos_content.json');
          fs.writeFileSync(jsonPath, JSON.stringify(artigos, null, 2), 'utf-8');
          console.log(`📝 artigos_content.json atualizado com ${artigos.length} artigos.`);
        }
      } catch (e) {
        console.warn('⚠️ Não foi possível regenerar artigos_content.json:', e.message);
      }
    } else {
      console.log('Arquivo content.md não encontrado.');
    }
  } catch (err) {
    console.error(`❌ Erro ao indexar content.md:`, err.message);
  }
  // Processar PDFs normalmente (caso ainda existam)
  const pdfFiles = await getAllPdfFiles(uploadsDir);
  console.log(`Encontrados ${pdfFiles.length} PDFs para indexar.`);
  for (const pdf of pdfFiles) {
    try {
      console.log(`Processando: ${pdf}`);
      await ragService.processPDF(pdf, 'ingest-script');
      console.log(`✅ Indexado: ${pdf}`);
    } catch (err) {
      console.error(`❌ Erro ao indexar ${pdf}:`, err.message);
    }
  }
  console.log('Ingestão automática concluída!');
}

async function getAllPdfFiles(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await getAllPdfFiles(filePath));
    } else if (file.name.toLowerCase().endsWith('.pdf')) {
      results.push(filePath);
    }
  }
  return results;
}

ingestAllUploads(); 