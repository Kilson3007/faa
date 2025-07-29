const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const ragService = require('../services/ragService');

// Rota para enviar mensagem de texto
router.post('/message', async (req, res) => {
  try {
    let referencia;
    const { message, userId } = req.body;

    console.log(`[CHAT] Mensagem recebida: ${message}`);

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    const startTime = Date.now();

    // Resposta especial para saudações
    const saudacoes = [
      'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'oi', 'saudações', 'salve', 'hello', 'hi'
    ];
    if (saudacoes.some(s => message.toLowerCase().includes(s))) {
      return res.json({
        success: true,
        data: {
          message: "Olá! Sou o assistente militar. Esteja à vontade para interação.",
          timestamp: new Date(),
          context: "Saudação"
        }
      });
    }

    // 1. Detectar referência direta a artigo, ponto, capítulo, etc.
    referencia = ragService.detectarReferencia(message);
    if (referencia) {
      // Buscar contexto diretamente no JSON via RAG
      const context = await ragService.searchRelevantContext(message);
      // Se encontrou contexto relevante, responder diretamente
      if (context && context.trim().length > 0 && !context.startsWith('O Artigo') && !context.startsWith('O ponto')) {
        // Se contexto não for resposta de ausência, passar para Gemini
        const response = await geminiService.generateResponse(message, context);
        if (response.success) {
          return res.json({
            success: true,
            data: {
              message: response.response,
              timestamp: response.timestamp,
              context: 'Contexto encontrado (referência direta)',
              source: 'direct_reference'
            }
          });
        } else {
          return res.status(500).json({ success: false, error: response.error });
        }
      } else {
        // Se contexto já for resposta pronta (ex: artigo não encontrado), retorna direto
        return res.json({
          success: true,
          data: {
            message: context,
            timestamp: new Date(),
            context: 'Contexto encontrado (referência direta)',
            source: 'direct_reference'
          }
        });
      }
    }
    // 2. Se não houver referência direta, consultar histórico de perguntas similares
    const similar = await ragService.suggestSimilarQuestion(message);
    if (similar) {
      console.log(`[RAG] Pergunta similar encontrada: "${similar.question}" (score: ${similar.score}) para "${message}"`);
      const responseTime = Date.now() - startTime;
      return res.json({
        success: true,
        data: {
          message: similar.answer,
          similarQuestion: similar.question,
          similarScore: similar.score,
          timesAsked: similar.timesAsked,
          suggestion: 'Pergunta similar encontrada. Veja se já resolve sua dúvida.',
          responseTime,
          source: 'similar_question'
        }
      });
    }

    // 3. Buscar contexto relevante usando RAG
    console.log(`🔎 [RAG] Iniciando busca de contexto para a pergunta: ${message}`);
    const context = await ragService.searchRelevantContext(message);
    if (!context || context.trim().length < 30) {
      console.log(`🔍 [RAG] Nenhum contexto relevante encontrado para: "${message}"`);
      console.log(`[RAG] Resposta enviada: Esta informação não está na minha base de conhecimento.`);
      return res.json({
        success: true,
        data: {
          message: "Esta informação não está na minha base de conhecimento.",
          timestamp: new Date(),
          context: "Sem contexto específico"
        }
      });
    } else {
      console.log(`🔍 [RAG] Contexto relevante encontrado para: "${message}"`);
    }
    // 4. Gerar resposta usando Gemini
    const response = await geminiService.generateResponse(message, context);
    console.log(`[RAG] Resposta enviada: ${response.response}`);

    // Adicionar referência explícita no início da resposta, se houver
    let respostaFinal = response.response;
    referencia = ragService.detectarReferencia(message);
    if (referencia) {
      // Montar string de referência
      let refStr = `De acordo com o ${referencia.tipo.charAt(0).toUpperCase() + referencia.tipo.slice(1)} ${referencia.numero}, `;
      // Se a resposta já começa com a referência, não duplicar
      if (!response.response.trim().toLowerCase().startsWith(`de acordo com o ${referencia.tipo}`) &&
          !response.response.trim().toLowerCase().startsWith(`${referencia.tipo}`)) {
        respostaFinal = refStr + response.response.charAt(0).toLowerCase() + response.response.slice(1);
      }
    }

    if (response.success) {
      const responseTime = Date.now() - startTime;
      
      // 5. Salvar pergunta/resposta no histórico
      await ragService.saveQuestionHistory(message, response.response, {
        userId,
        responseTime,
        contextFound: !!context
      });
      
      // 6. Sugerir perguntas populares do mesmo cluster
      let cluster = null;
      let popularQuestions = [];
      
      if (ragService.documents && ragService.documents.length > 0) {
        // Encontrar cluster do chunk mais relevante
        const relevant = ragService.documents
          .map((doc, i) => ({ doc, i, score: ragService.calculateSimilarity(message, doc.content) }))
          .sort((a, b) => b.score - a.score)[0];
        cluster = relevant ? relevant.doc.cluster : null;
        
        if (cluster !== null) {
          popularQuestions = await ragService.getPopularQuestionsByCluster(cluster, 3);
        }
      }
      
      res.json({
        success: true,
        data: {
          message: respostaFinal,
          timestamp: response.timestamp,
          context: context ? 'Contexto encontrado' : 'Sem contexto específico',
          popularQuestions,
          responseTime,
          cluster,
          source: 'new_response'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error
      });
    }
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para processar áudio (STT - Speech to Text)
router.post('/audio', async (req, res) => {
  try {
    const { audioData, audioFormat = 'wav' } = req.body;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        error: 'Dados de áudio são obrigatórios'
      });
    }

    // Placeholder: não faz transcrição real
    const transcribedText = "Áudio recebido (transcrição não implementada)";

    // Buscar contexto relevante
    const context = await ragService.searchRelevantContext(transcribedText);

    // Gerar resposta
    const response = await geminiService.generateResponse(transcribedText, context);

    if (response.success) {
      res.json({
        success: true,
        data: {
          transcribedText,
          message: response.response,
          timestamp: response.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error
      });
    }
  } catch (error) {
    console.error('Erro no processamento de áudio:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no processamento de áudio'
    });
  }
});

// Rota para obter resposta em áudio (TTS - Text to Speech)
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Texto é obrigatório'
      });
    }

    const voiceResponse = await geminiService.generateVoiceResponse(text);

    res.json({
      success: true,
      data: voiceResponse
    });
  } catch (error) {
    console.error('Erro na geração de voz:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na geração de voz'
    });
  }
});

// Rota para obter histórico de conversas (placeholder para futuras implementações)
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Placeholder - implementar quando tivermos banco de dados
  res.json({
    success: true,
    data: {
      messages: [],
      userId
    }
  });
});

module.exports = router; 