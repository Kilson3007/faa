const express = require('express');
const router = express.Router();
const ragService = require('../services/ragService');

// Rota para obter estatísticas do RAG
router.get('/stats', (req, res) => {
  try {
    const stats = ragService.getDocumentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas'
    });
  }
});

// Rota para buscar contexto relevante
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 3 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query é obrigatória'
      });
    }

    const context = await ragService.searchRelevantContext(query, limit);
    
    res.json({
      success: true,
      data: {
        query,
        context,
        limit
      }
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na busca de contexto'
    });
  }
});

// Rota para inicializar/carregar documentos
router.post('/initialize', async (req, res) => {
  try {
    const result = await ragService.loadDocuments();
    
    if (result) {
      res.json({
        success: true,
        data: {
          message: 'Sistema RAG inicializado com sucesso',
          stats: ragService.getDocumentStats()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao inicializar sistema RAG'
      });
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na inicialização do sistema RAG'
    });
  }
});

// Rota para testar o sistema RAG
router.post('/test', async (req, res) => {
  try {
    const { testQuery = 'regulamento militar' } = req.body;
    
    const context = await ragService.searchRelevantContext(testQuery, 2);
    const stats = ragService.getDocumentStats();
    
    res.json({
      success: true,
      data: {
        testQuery,
        context,
        stats,
        message: 'Teste do sistema RAG concluído'
      }
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no teste do sistema RAG'
    });
  }
});

// Rota para teste automatizado de perguntas sobre artigos
router.post('/test-articles', async (req, res) => {
  try {
    const testCases = [
      { q: 'o que diz o artigo 5', esperado: 5 },
      { q: 'explique o artigo cinco', esperado: 5 },
      { q: 'o quinto artigo fala sobre o quê?', esperado: 5 },
      { q: 'artigo 5º', esperado: 5 },
      { q: 'quinto artigo', esperado: 5 },
      { q: 'artigo número cinco', esperado: 5 },
      { q: 'me explique o artigo 5', esperado: 5 },
      { q: 'sobre o artigo cinco', esperado: 5 },
      { q: 'o artigo cinco', esperado: 5 },
      { q: '5º artigo', esperado: 5 },
    ];
    const results = [];
    for (const test of testCases) {
      const context = await ragService.searchRelevantContext(test.q, 2);
      results.push({ pergunta: test.q, contexto: context.substring(0, 120) + '...' });
    }
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para obter estatísticas do histórico de perguntas
router.get('/history/stats', async (req, res) => {
  try {
    const stats = await ragService.getQuestionHistoryStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas do histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter estatísticas do histórico'
    });
  }
});

// Rota para limpar histórico antigo
router.delete('/history/clean', async (req, res) => {
  try {
    const { daysOld = 30 } = req.query;
    const deletedCount = await ragService.cleanOldHistory(parseInt(daysOld));
    
    res.json({
      success: true,
      data: {
        message: `Histórico limpo com sucesso`,
        deletedCount,
        daysOld: parseInt(daysOld)
      }
    });
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar histórico'
    });
  }
});

// Rota para buscar perguntas populares por cluster
router.get('/history/popular/:cluster', async (req, res) => {
  try {
    const { cluster } = req.params;
    const { limit = 5 } = req.query;
    
    const questions = await ragService.getPopularQuestionsByCluster(parseInt(cluster), parseInt(limit));
    
    res.json({
      success: true,
      data: {
        cluster: parseInt(cluster),
        questions,
        count: questions.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perguntas populares:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar perguntas populares'
    });
  }
});

// Rota para buscar perguntas similares
router.post('/history/similar', async (req, res) => {
  try {
    const { question, threshold = 0.8, limit = 5 } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pergunta é obrigatória'
      });
    }
    
    const similar = await ragService.suggestSimilarQuestion(question);
    
    res.json({
      success: true,
      data: {
        originalQuestion: question,
        similar: similar ? [similar] : [],
        threshold,
        count: similar ? 1 : 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perguntas similares:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar perguntas similares'
    });
  }
});

<<<<<<< HEAD
=======
// Rota para listar documentos disponíveis
router.get('/documents', async (req, res) => {
  try {
    const client = require('../services/postgresService');
    const result = await client.query(`
      SELECT 
        id, 
        filename, 
        original_name, 
        file_size, 
        mime_type, 
        document_type, 
        category, 
        tags,
        created_at
      FROM 
        documentos
      ORDER BY 
        created_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(doc => ({
        ...doc,
        file_size_mb: (doc.file_size / (1024 * 1024)).toFixed(2) + ' MB'
      }))
    });
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar documentos',
      message: error.message
    });
  }
});

>>>>>>> 2558089a4cf88e8b76387127c4ed9dc0cfdf7d6a
module.exports = router; 