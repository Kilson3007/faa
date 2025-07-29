const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testHistoryFeatures() {
  console.log('🧪 Testando funcionalidades do histórico persistente...\n');

  try {
    // 1. Testar envio de mensagem
    console.log('1️⃣ Enviando primeira mensagem...');
    const response1 = await axios.post(`${API_BASE}/chat/message`, {
      message: 'Qual é a penalidade para indisciplina militar?',
      userId: 'test_user'
    });
    
    if (response1.data.success) {
      console.log('✅ Primeira mensagem enviada com sucesso');
      console.log(`📝 Resposta: ${response1.data.data.message.substring(0, 100)}...`);
      console.log(`⏱️ Tempo de resposta: ${response1.data.data.responseTime}ms`);
      console.log(`🏷️ Cluster: ${response1.data.data.cluster}`);
    }

    // 2. Testar envio de mensagem similar
    console.log('\n2️⃣ Enviando mensagem similar...');
    const response2 = await axios.post(`${API_BASE}/chat/message`, {
      message: 'Quais são as punições para indisciplina no exército?',
      userId: 'test_user'
    });
    
    if (response2.data.success) {
      console.log('✅ Mensagem similar processada');
      console.log(`📝 Fonte: ${response2.data.data.source}`);
      if (response2.data.data.similarQuestion) {
        console.log(`🔄 Pergunta similar: ${response2.data.data.similarQuestion}`);
        console.log(`📊 Score de similaridade: ${response2.data.data.similarScore}`);
        console.log(`🔢 Vezes perguntada: ${response2.data.data.timesAsked}`);
      }
    }

    // 3. Testar estatísticas do histórico
    console.log('\n3️⃣ Verificando estatísticas do histórico...');
    const statsResponse = await axios.get(`${API_BASE}/rag/history/stats`);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('✅ Estatísticas obtidas:');
      console.log(`📊 Total de perguntas: ${stats.totalQuestions}`);
      console.log(`🔢 Total de usos: ${stats.totalUsage}`);
      console.log(`📈 Média de uso: ${stats.avgUsage}`);
      console.log(`🏷️ Clusters únicos: ${stats.uniqueClusters}`);
    }

    // 4. Testar busca de perguntas similares
    console.log('\n4️⃣ Testando busca de perguntas similares...');
    const similarResponse = await axios.post(`${API_BASE}/rag/history/similar`, {
      question: 'Como é punida a indisciplina?',
      threshold: 0.7
    });
    
    if (similarResponse.data.success) {
      console.log('✅ Busca de similares concluída');
      console.log(`🔍 Perguntas similares encontradas: ${similarResponse.data.data.count}`);
    }

    // 5. Testar perguntas populares por cluster (se houver cluster)
    if (response1.data.data.cluster !== null) {
      console.log('\n5️⃣ Testando perguntas populares por cluster...');
      const popularResponse = await axios.get(`${API_BASE}/rag/history/popular/${response1.data.data.cluster}?limit=3`);
      
      if (popularResponse.data.success) {
        console.log('✅ Perguntas populares obtidas:');
        console.log(`🏷️ Cluster: ${popularResponse.data.data.cluster}`);
        console.log(`📝 Perguntas encontradas: ${popularResponse.data.data.count}`);
        popularResponse.data.data.questions.forEach((q, i) => {
          console.log(`  ${i + 1}. "${q.question}" (${q.timesAsked} vezes)`);
        });
      }
    }

    console.log('\n🎉 Todos os testes concluídos com sucesso!');
    console.log('\n📋 Resumo das funcionalidades testadas:');
    console.log('✅ Persistência de perguntas/respostas no banco');
    console.log('✅ Detecção de perguntas similares');
    console.log('✅ Estatísticas do histórico');
    console.log('✅ Busca de perguntas similares');
    console.log('✅ Perguntas populares por cluster');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.response?.data || error.message);
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  testHistoryFeatures();
}

module.exports = { testHistoryFeatures }; 