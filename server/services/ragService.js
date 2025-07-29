const { GoogleGenerativeAI } = require('@google/generative-ai');
const natural = require('natural');
const stringSimilarity = require('string-similarity');
const { kMeans } = require('../utils/cluster');
const client = require('./postgresService');

// Função utilitária para converter números romanos para arábicos
function romanoParaNumero(romano) {
  if (!romano) return null;
  const mapa = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000};
  let num = 0, prev = 0;
  romano = romano.toUpperCase();
  for (let i = romano.length - 1; i >= 0; i--) {
    const val = mapa[romano[i]];
    if (!val) return null;
    if (val < prev) num -= val;
    else num += val;
    prev = val;
  }
  return num;
}

// Função utilitária para normalizar número de artigo (aceita 5, 5º, quinto, Quinto, cinco, V, v, etc.)
function normalizarNumeroArtigo(input) {
  if (!input) return null;
  const mapaExtenso = {
    'um': 1, 'primeiro': 1, 'dois': 2, 'segundo': 2, 'três': 3, 'terceiro': 3, 'quatro': 4, 'quarto': 4, 'cinco': 5, 'quinto': 5,
    'seis': 6, 'sexto': 6, 'sete': 7, 'sétimo': 7, 'oito': 8, 'oitavo': 8, 'nove': 9, 'nono': 9, 'dez': 10, 'décimo': 10,
    'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quatorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezasseis': 16,
    'dezessete': 17, 'dezassete': 17, 'dezoito': 18, 'dezenove': 19, 'dezanove': 19, 'vinte': 20,
    'vinte e um': 21, 'vinte e dois': 22, 'vinte e três': 23, 'vinte e quatro': 24, 'vinte e cinco': 25,
    'vinte e seis': 26, 'vinte e sete': 27, 'vinte e oito': 28, 'vinte e nove': 29, 'trinta': 30,
    'trinta e um': 31, 'trinta e dois': 32, 'trinta e três': 33, 'trinta e quatro': 34, 'trinta e cinco': 35,
    'trinta e seis': 36, 'trinta e sete': 37, 'trinta e oito': 38, 'trinta e nove': 39, 'quarenta': 40,
    'quarenta e um': 41, 'quarenta e dois': 42, 'quarenta e três': 43, 'quarenta e quatro': 44, 'quarenta e cinco': 45,
    'quarenta e seis': 46, 'quarenta e sete': 47, 'quarenta e oito': 48, 'quarenta e nove': 49, 'cinquenta': 50,
    'cinquenta e um': 51
  };
  // Remover º, °, etc.
  let norm = String(input).toLowerCase().replace(/[º°]/g, '').trim();
  // Tentar converter direto para número
  if (/^\d+$/.test(norm)) return Number(norm);
  // Tentar por extenso
  if (mapaExtenso[norm]) return mapaExtenso[norm];
  // Tentar ordinal (quinto, décimo, etc.)
  for (const [k, v] of Object.entries(mapaExtenso)) {
    if (norm === k) return v;
  }
  // Tentar romano
  const romanos = {i:1, ii:2, iii:3, iv:4, v:5, vi:6, vii:7, viii:8, ix:9, x:10, xi:11, xii:12, xiii:13, xiv:14, xv:15, xvi:16, xvii:17, xviii:18, xix:19, xx:20, xxi:21, xxii:22, xxiii:23, xxiv:24, xxv:25, xxvi:26, xxvii:27, xxviii:28, xxix:29, xxx:30, xxxi:31, xxxii:32, xxxiii:33, xxxiv:34, xxxv:35, xxxvi:36, xxxvii:37, xxxviii:38, xxxix:39, xl:40, xli:41, xlii:42, xliii:43, xliv:44, xlv:45, xlvi:46, xlvii:47, xlviii:48, xlix:49, l:50, li:51};
  if (romanos[norm]) return romanos[norm];
  return null;
}

// --- INÍCIO: Integração artigos_content.json ---
const fs = require('fs');
let artigosContent = [];
try {
  artigosContent = JSON.parse(fs.readFileSync(require('path').join(__dirname, '../../artigos_content.json'), 'utf-8'));
  console.log(`[RAG] artigos_content.json carregado com ${artigosContent.length} artigos.`);
} catch (e) {
  console.warn('[RAG] Não foi possível carregar artigos_content.json:', e.message);
}

// Atualizar buscarArtigoPorNumero para aceitar variações
function buscarArtigoPorNumero(numero) {
  const n = normalizarNumeroArtigo(numero);
  console.log(`[DEPURADOR] buscarArtigoPorNumero: input='${numero}', normalizado='${n}'`);
  if (!n) return undefined;
  return artigosContent.find(a => Number(a.numero) === n);
}

function buscarPontoDoArtigo(numero, ponto) {
  const artigo = buscarArtigoPorNumero(numero);
  if (!artigo || !artigo.pontos || artigo.pontos.length === 0) return null;
  const idx = Number(ponto) - 1;
  return artigo.pontos[idx] ? { artigo, ponto: artigo.pontos[idx], idx: idx + 1 } : null;
}

function buscarArtigoPorSimilaridade(pergunta) {
  // Busca simples: maior similaridade no resumo, pontos ou texto
  let best = null;
  let bestScore = 0;
  for (const artigo of artigosContent) {
    let score = 0;
    if (artigo.resumo && pergunta && artigo.resumo.toLowerCase().includes(pergunta.toLowerCase())) score += 2;
    if (artigo.titulo && pergunta && artigo.titulo.toLowerCase().includes(pergunta.toLowerCase())) score += 1.5;
    if (artigo.texto && pergunta && artigo.texto.toLowerCase().includes(pergunta.toLowerCase())) score += 1;
    if (artigo.pontos && artigo.pontos.some(p => pergunta && p.toLowerCase().includes(pergunta.toLowerCase()))) score += 1.5;
    if (score > bestScore) {
      best = artigo;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}
// --- FIM: Integração artigos_content.json ---

class RAGService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.documents = [];
    this.referenceIndex = {};
    this.chunkSize = parseInt(process.env.CHUNK_SIZE) || 1000;
    this.chunkOverlap = parseInt(process.env.CHUNK_OVERLAP) || 200;
    this.kClusters = 5;
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  // Processar texto e extrair características para similaridade
  processText(text) {
    // Normalizar texto
    const normalized = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Tokenizar e remover stop words
    const tokens = this.tokenizer.tokenize(normalized);
    const stopWords = new Set(['a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com', 'não', 'na', 'no', 'se', 'que', 'por', 'mais', 'as', 'como', 'mas', 'foi', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'minha', 'têm', 'naquele', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'você', 'vocês', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'mesma', 'pelos', 'às', 'está', 'estamos', 'estão', 'estou', 'estava', 'estavam', 'estávamos', 'estes', 'este', 'estas', 'esta', 'estou', 'está', 'estamos', 'estão', 'estava', 'estavam', 'estávamos', 'estive', 'esteve', 'estivemos', 'estiveram', 'estivesse', 'estivessem', 'estivéssemos', 'estiver', 'estivermos', 'estiverem', 'hei', 'há', 'havemos', 'hão', 'havia', 'haviam', 'havíamos', 'houve', 'houveram', 'houvesse', 'houvessem', 'houvéssemos', 'houver', 'houvermos', 'houverem', 'houverei', 'houverá', 'houveremos', 'houverão', 'houveria', 'houveriam', 'houveríamos', 'sou', 'somos', 'são', 'era', 'eram', 'éramos', 'fui', 'foi', 'fomos', 'foram', 'fosse', 'fossem', 'fôssemos', 'for', 'formos', 'forem', 'serei', 'será', 'seremos', 'serão', 'seria', 'seriam', 'seríamos', 'tenho', 'tem', 'temos', 'têm', 'tinha', 'tinham', 'tínhamos', 'tive', 'teve', 'tivemos', 'tiveram', 'tivesse', 'tivessem', 'tivéssemos', 'tiver', 'tivermos', 'tiverem', 'terei', 'terá', 'teremos', 'terão', 'teria', 'teriam', 'teríamos']);
    
    const filteredTokens = tokens.filter(token => 
      token.length > 2 && !stopWords.has(token)
    );
    
    return {
      normalized,
      tokens: filteredTokens,
      keywords: this.extractKeywords(filteredTokens)
    };
  }

  // Extrair palavras-chave militares
  extractKeywords(tokens) {
    const militaryKeywords = [
      'militar', 'militares', 'regulamento', 'regulamentos', 'disciplina', 'disciplinas', 'ordem', 'ordens', 'patente',
      'unidade', 'comando', 'ordem', 'dever', 'responsabilidade', 'hierarquia', 'hierarquias', 'assiduidade', 'sargento', 'sargentos',
      'penalidade', 'sanção', 'sanções', 'crime', 'crimes', 'lei', 'leis', 'norma', 'normas', 'exército', 'pontualidade',
      'marinha', 'aeronáutica', 'forças', 'força Aérea', 'armadas', 'soldado', 'soldados', 'oficial', 'oficiais', 'formaturas',
      'subalterno', 'sargento', 'capitão', 'major', 'coronel', 'general', 'Cadeia', 'penalidade', 'punição', 'punições',
      'cabo', 'cabos', 'brigadeiro', 'tenente', 'aspirante', 'aspirante', 'capitão', 'General', 'Tenente General', 'cadete'
    ];
    
    return tokens.filter(token => 
      militaryKeywords.some(keyword => token.includes(keyword))
    );
  }

  // Calcular similaridade entre dois textos
  calculateSimilarity(text1, text2) {
    const processed1 = this.processText(text1);
    const processed2 = this.processText(text2);
    
    // Similaridade de string
    const stringSim = stringSimilarity.compareTwoStrings(
      processed1.normalized, 
      processed2.normalized
    );
    
    // Similaridade de palavras-chave
    const keywordSim = this.calculateKeywordSimilarity(
      processed1.keywords, 
      processed2.keywords
    );
    
    // Similaridade de tokens
    const tokenSim = this.calculateTokenSimilarity(
      processed1.tokens, 
      processed2.tokens
    );
    
    // Peso combinado (dar mais peso para palavras-chave militares)
    return (stringSim * 0.3) + (keywordSim * 0.5) + (tokenSim * 0.2);
  }

  // Calcular similaridade de palavras-chave
  calculateKeywordSimilarity(keywords1, keywords2) {
    if (keywords1.length === 0 && keywords2.length === 0) return 1;
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const intersection = keywords1.filter(k1 => 
      keywords2.some(k2 => k1 === k2 || k1.includes(k2) || k2.includes(k1))
    );
    
    const union = new Set([...keywords1, ...keywords2]);
    return intersection.length / union.size;
  }

  // Calcular similaridade de tokens
  calculateTokenSimilarity(tokens1, tokens2) {
    if (tokens1.length === 0 && tokens2.length === 0) return 1;
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    
    const intersection = tokens1.filter(t1 => 
      tokens2.some(t2 => t1 === t2 || t1.includes(t2) || t2.includes(t1))
    );
    
    const union = new Set([...tokens1, ...tokens2]);
    return intersection.length / union.size;
  }

  // Gerar embedding simples baseado em características do texto
  generateSimpleEmbedding(text) {
    const processed = this.processText(text);
    
    // Criar vetor de características
    const features = {
      length: text.length,
      wordCount: processed.tokens.length,
      keywordCount: processed.keywords.length,
      militaryTerms: processed.keywords.length,
      hasQuestion: text.includes('?') || text.includes('qual') || text.includes('como'),
      hasPenalty: text.includes('penalidade') || text.includes('punição') || text.includes('sanção'),
      hasRegulation: text.includes('regulamento') || text.includes('norma') || text.includes('lei')
    };
    
    // Converter para array numérico
    return Object.values(features);
  }

  // Utilitário para converter número por extenso para número
  extensoParaNumero(palavra) {
    const mapa = {
      'um': 1, 'primeiro': 1, 'dois': 2, 'segundo': 2, 'três': 3, 'terceiro': 3, 'quatro': 4, 'quarto': 4, 'cinco': 5, 'quinto': 5,
      'seis': 6, 'sexto': 6, 'sete': 7, 'sétimo': 7, 'oito': 8, 'oitavo': 8, 'nove': 9, 'nono': 9, 'dez': 10, 'décimo': 10,
      'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quatorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezasseis': 16,
      'dezessete': 17, 'dezassete': 17, 'dezoito': 18, 'dezenove': 19, 'dezanove': 19, 'vinte': 20
    };
    return mapa[palavra.toLowerCase()] || null;
  }

  // Função utilitária para normalizar e detectar referência a qualquer elemento (artigo, capítulo, seção, tópico, parágrafo, ponto)
  detectarReferencia(question) {
    // Mapas para números por extenso
    const extensoParaNumero = palavra => {
      const mapa = {
        'um': 1, 'primeiro': 1, 'dois': 2, 'segundo': 2, 'três': 3, 'terceiro': 3, 'quatro': 4, 'quarto': 4, 'cinco': 5, 'quinto': 5,
        'seis': 6, 'sexto': 6, 'sete': 7, 'sétimo': 7, 'oito': 8, 'oitavo': 8, 'nove': 9, 'nono': 9, 'dez': 10, 'décimo': 10,
        'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quatorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezasseis': 16,
        'dezessete': 17, 'dezassete': 17, 'dezoito': 18, 'dezenove': 19, 'dezanove': 19, 'vinte': 20
      };
      return mapa[palavra.toLowerCase()] || null;
    };
    // Detectar número romano isolado (ex: artigo V, capítulo IX)
    const matchRomano = question.match(/(artigo|cap[ií]tulo|se[cç][aã]o|t[óo]pico|par[aá]grafo|ponto)\s+([ivxlcdm]+)/i);
    if (matchRomano) {
      const n = romanoParaNumero(matchRomano[2]);
      if (n) {
        console.log(`[DEPURADOR] detectarReferencia: tipo=${matchRomano[1]}, numero(romano)=${n}`);
        return { tipo: matchRomano[1].toLowerCase(), numero: n };
      }
    }
    // Lista de tipos de referência e regex
    const tipos = [
      { tipo: 'artigo', regex: /(artigo)\s*(\d+|[a-zçãéêóõú]+)/i },
      { tipo: 'capítulo', regex: /(cap[ií]tulo|cap\.?|capitulo)\s*(\d+|[a-zçãéêóõú]+)/i },
      { tipo: 'seção', regex: /(se[cç][aã]o|sec\.?|seccao|seção)\s*(\d+|[a-zçãéêóõú]+)/i },
      { tipo: 'tópico', regex: /(t[óo]pico|top\.?|topico)\s*(\d+|[a-zçãéêóõú]+)/i },
      { tipo: 'parágrafo', regex: /(par[aá]grafo|par\.?|paragrafo)\s*(\d+|[a-zçãéêóõú]+)/i },
      { tipo: 'ponto', regex: /(ponto|pt\.?|item)\s*(\d+|[a-zçãéêóõú]+)/i },
    ];
    for (const t of tipos) {
      let m = question.match(t.regex);
      if (m) {
        let n = parseInt(m[2], 10);
        if (isNaN(n)) n = extensoParaNumero(m[2]);
        if (n) {
          console.log(`[DEPURADOR] detectarReferencia: tipo=${t.tipo}, numero=${n}`);
          return { tipo: t.tipo, numero: n };
        }
      }
      // Também aceitar "nº X" ou "número X" após o tipo
      m = question.match(new RegExp(`${t.regex.source}\s*(n[úu]mero|n[ºo])?\s*(\d+|[a-zçãéêóõú]+)`, 'i'));
      if (m) {
        let n = parseInt(m[3], 10);
        if (isNaN(n)) n = extensoParaNumero(m[3]);
        if (n) {
          console.log(`[DEPURADOR] detectarReferencia: tipo=${t.tipo}, numero=${n}`);
          return { tipo: t.tipo, numero: n };
        }
      }
    }
    // Também aceitar "quinto artigo", "terceiro capítulo", etc.
    for (const t of tipos) {
      let m = question.match(new RegExp(`([a-zçãéêóõú]+)\s*${t.tipo}`, 'i'));
      if (m) {
        let n = extensoParaNumero(m[1]);
        if (n) {
          console.log(`[DEPURADOR] detectarReferencia: tipo=${t.tipo}, numero=${n}`);
          return { tipo: t.tipo, numero: n };
        }
      }
    }
    return null;
  }

  // Novo: carregar documentos e chunks do PostgreSQL
  async loadDocuments() {
    try {
      console.log('📚 Carregando documentos do PostgreSQL...');
      const res = await client.query(`
        SELECT d.id, d.filename, f.content, f.page, f.chunk_index
        FROM documentos d
        JOIN fragmentos_documento f ON f.document_id = d.id
        ORDER BY d.id, f.chunk_index
      `);
      this.documents = [];
      this.referenceIndex = {};
      for (const row of res.rows) {
        this.documents.push({
          content: row.content,
          embedding: this.generateSimpleEmbedding(row.content),
          source: row.filename,
          page: row.page || 1
        });
        // Indexar por artigo, capítulo, seção, tópico, parágrafo, ponto
        const tipos = [
          { tipo: 'artigo', regex: /artigo\s*(\d+)[º°]?/i },
          { tipo: 'capítulo', regex: /cap[ií]tulo\s*(\d+)/i },
          { tipo: 'seção', regex: /se[cç][aã]o\s*(\d+)/i },
          { tipo: 'tópico', regex: /t[óo]pico\s*(\d+)/i },
          { tipo: 'parágrafo', regex: /par[aá]grafo\s*(\d+)/i },
          { tipo: 'ponto', regex: /ponto\s*(\d+)/i },
        ];
        for (const t of tipos) {
          const m = row.content.match(t.regex);
          if (m) {
            this.referenceIndex[`${t.tipo} ${m[1]}`] = row.content;
            this.referenceIndex[`${t.tipo} ${parseInt(m[1], 10)}`] = row.content;
            if (m[1].length === 1) this.referenceIndex[`${t.tipo} 0${m[1]}`] = row.content;
          }
        }
      }
      console.log(`📚 Carregados ${this.documents.length} chunks do PostgreSQL`);
      await this.clusterizeChunks();
      await this.loadQuestionHistory();
      return true;
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error);
      return false;
    }
  }

  async clusterizeChunks() {
    if (this.documents.length === 0) return;
    const allEmbeddings = this.documents.map(doc => doc.embedding);
    const clusters = kMeans(allEmbeddings, this.kClusters);
    this.documents.forEach((doc, i) => doc.cluster = clusters[i]);
    console.log(`🔗 Clusterização concluída: ${this.kClusters} clusters.`);
  }

  // Busca robusta de chunk por referência
  findReferenceChunk(question) {
    const ref = this.detectarReferencia(question);
    if (ref) {
      if (this.referenceIndex[`${ref.tipo} ${ref.numero}`]) return this.referenceIndex[`${ref.tipo} ${ref.numero}`];
      if (this.referenceIndex[`${ref.tipo} 0${ref.numero}`]) return this.referenceIndex[`${ref.tipo} 0${ref.numero}`];
      // Buscar por extenso
      for (const key of Object.keys(this.referenceIndex)) {
        if (key.endsWith(` ${ref.numero}`)) return this.referenceIndex[key];
      }
    }
    return null;
  }

  // Ajustar busca de contexto para usar findReferenceChunk
  async searchRelevantContext(question, limit = 5) {
    try {
      // 1. Buscar chunk por referência (artigo, capítulo, seção, etc.)
      const ref = this.detectarReferencia(question);
      console.log(`[DEPURADOR] Pergunta recebida: "${question}"`);
      console.log(`[DEPURADOR] Referência detectada:`, ref);
      // --- INÍCIO: Busca direta no artigos_content.json ---
      let artigoDireto = null;
      let pontoDireto = null;
      let contextoArtigo = '';
      if (ref && ref.tipo === 'artigo') {
        artigoDireto = buscarArtigoPorNumero(ref.numero);
        if (!artigoDireto) {
          console.log(`[DEPURADOR] Artigo solicitado não encontrado: ${ref.numero}`);
          return `O Artigo ${ref.numero}º não está presente nas normas reguladoras disponíveis.`;
        }
        // Resposta didática e patriótica
        let resposta = `O Artigo ${artigoDireto.numero}º (${artigoDireto.titulo}) das Normas Reguladoras da Disciplina Militar das FAA`;
        if (artigoDireto.resumo) resposta += `: ${artigoDireto.resumo}`;
        if (artigoDireto.texto) resposta += `\n${artigoDireto.texto}`;
        if (artigoDireto.pontos && artigoDireto.pontos.length > 0) {
          resposta += `\nPrincipais pontos do artigo:`;
          artigoDireto.pontos.forEach((p, i) => {
            resposta += `\n${i+1}. ${p}`;
          });
        }
      
      } else if (ref && ref.tipo === 'ponto') {
        // Procurar ponto do artigo mais recente citado antes na pergunta
        const artigoNum = (question.match(/artigo\s*(\d+)/i) || [])[1];
        if (artigoNum) pontoDireto = buscarPontoDoArtigo(artigoNum, ref.numero);
        if (pontoDireto) {
          let resposta = `O ponto ${pontoDireto.idx} do Artigo ${pontoDireto.artigo.numero}º (${pontoDireto.artigo.titulo}) diz: ${pontoDireto.ponto}\n\nLembre-se: cada ponto destes artigos representa um valor essencial para a vida militar e para o serviço à Nação.`;
          console.log(`[DEPURADOR] Ponto retornado: Artigo ${pontoDireto.artigo.numero} - Ponto ${pontoDireto.idx}`);
          contextoArtigo = resposta;
        } else {
          console.log(`[DEPURADOR] Ponto solicitado não encontrado: ${ref.numero}`);
          return `O ponto ${ref.numero} não foi encontrado no artigo mencionado.`;
        }
      }
      // Busca por similaridade textual no content.md
      if (!contextoArtigo) {
        const artigoSimilar = buscarArtigoPorSimilaridade(question);
        if (artigoSimilar) {
          let resposta = `O Artigo ${artigoSimilar.numero}º (${artigoSimilar.titulo}) das Normas Reguladoras da Disciplina Militar das FAA`;
          if (artigoSimilar.resumo) resposta += `: ${artigoSimilar.resumo}`;
          if (artigoSimilar.texto) resposta += `\n${artigoSimilar.texto}`;
          if (artigoSimilar.pontos && artigoSimilar.pontos.length > 0) {
            resposta += `\nPrincipais pontos do artigo:`;
            artigoSimilar.pontos.forEach((p, i) => {
              resposta += `\n${i+1}. ${p}`;
            });
          }
          resposta += `\n\nComo educador patriótico, reforço a importância de conhecer e praticar estes princípios para fortalecer a disciplina e o espírito de serviço à Pátria.`;
          console.log(`[DEPURADOR] Artigo similar retornado: ${artigoSimilar.numero} - ${artigoSimilar.titulo}`);
          contextoArtigo = resposta;
        }
      }
      // --- FIM: Busca direta no artigos_content.json ---
      // Agora, sempre que houver contextoArtigo, incluir no contexto do Gemini junto com o contexto tradicional do RAG
      const refChunk = this.findReferenceChunk(question);
      let context = '';
      if (contextoArtigo) {
        context += contextoArtigo + '\n\n';
      }
      if (refChunk) {
        context += refChunk + '\n\n';
        console.log(`[DEPURADOR] Chunk encontrado para referência: ${ref ? ref.tipo : ''} ${ref ? ref.numero : ''}`);
      } else {
        console.log(`[DEPURADOR] Nenhum chunk encontrado para referência detectada.`);
      }
      // 2. Buscar outros chunks relevantes por similaridade
      let relevantDocs = this.documents
        .map(doc => ({
          ...doc,
          score: this.calculateSimilarity(question, doc.content)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      relevantDocs = relevantDocs.filter(doc => doc.score > 0.1);
      context += relevantDocs.map(doc => doc.content).join('\n\n');
      if (relevantDocs.length > 0) {
        console.log(`[DEPURADOR] Chunks relevantes por similaridade:`, relevantDocs.map(d => d.content.substring(0, 80)));
      } else {
        console.log(`[DEPURADOR] Nenhum chunk relevante por similaridade encontrado.`);
      }
      // Fallback: se não houver contexto, retornar chunk mais similar
      if (!context.trim() && this.documents.length > 0) {
        const best = this.documents
          .map(doc => ({ ...doc, score: this.calculateSimilarity(question, doc.content) }))
          .sort((a, b) => b.score - a.score)[0];
        if (best && best.score > 0) {
          context = best.content;
          console.log(`[DEPURADOR] Fallback: retornando chunk mais similar (score: ${best.score.toFixed(2)})`);
        } else {
          console.log(`[DEPURADOR] Nenhum contexto relevante encontrado para a pergunta.`);
        }
      }
      console.log(`[DEPURADOR] Contexto final retornado:`, context.substring(0, 200));
      return context.trim();
    } catch (error) {
      console.error('❌ [RAG] Erro na busca de contexto:', error);
      return '';
    }
  }

  // Sugestão de perguntas/respostas similares usando banco
  async suggestSimilarQuestion(query) {
    try {
      const res = await client.query(`
        SELECT id, question, answer, embedding, cluster, metadata, times_asked
        FROM historico_perguntas
        ORDER BY created_at DESC
        LIMIT 10
      `);
      let bestScore = 0;
      let best = null;
      for (const row of res.rows) {
        const score = this.calculateSimilarity(query, row.question);
        if (score > bestScore && score > 0.8) {
          bestScore = score;
          best = row;
        }
      }
      if (best) {
        // Incrementar contador de uso se a coluna existir
        try {
          await client.query('UPDATE historico_perguntas SET times_asked = COALESCE(times_asked, 1) + 1 WHERE id = $1', [best.id]);
        } catch (e) {
          // Ignorar erro se coluna não existir
        }
        return {
          question: best.question,
          answer: best.answer,
          score: bestScore,
          timesAsked: best.times_asked || 1
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar pergunta similar:', error);
      return null;
    }
  }

  // Salvar pergunta/resposta no banco
  async saveQuestionHistory(question, answer, metadata = {}) {
    try {
      let embedding = this.generateSimpleEmbedding(question);
      // Garante que é array de float
      const embeddingArray = Array.isArray(embedding) ? embedding.map(Number) : [];
      // Determinar cluster baseado no contexto mais relevante
      let cluster = null;
      if (this.documents && this.documents.length > 0) {
        const relevant = this.documents
          .map((doc, i) => ({
            doc,
            i,
            score: this.calculateSimilarity(question, doc.content)
          }))
          .sort((a, b) => b.score - a.score)[0];
        cluster = relevant ? relevant.doc.cluster : null;
      }
      await client.query(`
        INSERT INTO historico_perguntas (question, answer, embedding, cluster, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [question, answer, embeddingArray, cluster, JSON.stringify(metadata)]);
      console.log(`💾 Pergunta salva no histórico: "${question.substring(0, 50)}..."`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar pergunta no histórico:', error);
      throw error;
    }
  }

  // Sugerir perguntas populares do mesmo cluster usando banco
  async getPopularQuestionsByCluster(cluster, limit = 3) {
    try {
      const res = await client.query(`
        SELECT question, times_asked
        FROM historico_perguntas
        WHERE cluster = $1
        ORDER BY times_asked DESC
        LIMIT $2
      `, [cluster, limit]);
      return res.rows.map(q => ({
        question: q.question,
        timesAsked: q.times_asked
      }));
    } catch (error) {
      console.error('Erro ao buscar perguntas populares:', error);
      return [];
    }
  }

  // Novo: carregar histórico de perguntas do PostgreSQL
  async loadQuestionHistory() {
    try {
      const res = await client.query('SELECT * FROM historico_perguntas ORDER BY created_at DESC');
      if (res.rows.length > 0) {
        console.log(`📊 Histórico carregado: ${res.rows.length} perguntas`);
      }
      // Você pode armazenar em this.questionHistory se quiser cache local
      this.questionHistory = res.rows;
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  }

  // Obter estatísticas do histórico
  async getQuestionHistoryStats() {
    try {
      const res = await client.query('SELECT COUNT(*) as total_questions, SUM(times_asked) as total_usage FROM historico_perguntas');
      const totalQuestions = res.rows[0].total_questions;
      const totalUsage = res.rows[0].total_usage;
      const avgUsage = totalQuestions > 0 ? totalUsage / totalQuestions : 0;

      const resClusters = await client.query('SELECT COUNT(DISTINCT cluster) as unique_clusters FROM historico_perguntas WHERE cluster IS NOT NULL');
      const uniqueClusters = resClusters.rows[0].unique_clusters;

      return { totalQuestions, totalUsage, avgUsage, uniqueClusters };
    } catch (error) {
      console.error('Erro ao obter estatísticas do histórico:', error);
      return { totalQuestions: 0, totalUsage: 0, avgUsage: 0, uniqueClusters: 0 };
    }
  }

  // Limpar histórico antigo
  async cleanOldHistory(daysOld = 30) {
    try {
      const res = await client.query(`
        DELETE FROM historico_perguntas
        WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      `);
      console.log(`🧹 Histórico limpo: ${res.rowCount} perguntas removidas`);
      return res.rowCount;
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      return 0;
    }
  }

  // Obter estatísticas dos documentos
  getDocumentStats() {
    return {
      totalDocuments: this.documents.length,
      totalChunks: this.documents.length,
      sources: [...new Set(this.documents.map(doc => doc.source))],
      clusters: this.kClusters,
      databaseStats: {
        totalDocuments: this.documents.length,
        totalChunks: this.documents.length,
        totalSizeMB: Math.round(this.documents.reduce((acc, doc) => acc + doc.content.length, 0) / 1024 / 1024 * 100) / 100
      }
    };
  }

  // Processar PDF (simplificado)
  async processPDF(filePath, uploadedBy) {
    try {
      console.log(`📄 Processando PDF: ${filePath}`);
      const pdfParse = require('pdf-parse');
      const fs = require('fs');
      const mongoose = require('mongoose');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      // Dividir em chunks
      const chunks = this.createChunks(data.text);
      // Gerar embeddings simples para cada chunk
      const processedChunks = chunks.map((chunk, index) => ({
        content: chunk,
        embedding: this.generateSimpleEmbedding(chunk),
        page: Math.floor(index / 3) + 1, // Estimativa de página
        chunkIndex: index,
        metadata: {
          keywords: this.extractKeywords(this.processText(chunk).tokens)
        }
      }));
      // Salvar no banco
      const Document = require('../models/Document');
      // uploadedBy precisa ser um ObjectId válido
      let uploader = uploadedBy;
      if (!mongoose.Types.ObjectId.isValid(uploadedBy)) {
        // Se não for um ObjectId, usar um ID dummy (ou null se preferir)
        uploader = new mongoose.Types.ObjectId();
      }
      // Detectar tipo e categoria pelo nome do arquivo
      let documentType = 'outro';
      let category = 'geral';
      const lower = filePath.toLowerCase();
      if (lower.includes('regulamento')) documentType = 'regulamento';
      else if (lower.includes('lei')) documentType = 'lei';
      else if (lower.includes('manual')) documentType = 'manual';
      if (lower.includes('exercito')) category = 'exército';
      else if (lower.includes('marinha')) category = 'marinha';
      else if (lower.includes('aeronautica')) category = 'aeronáutica';
      const stats = fs.statSync(filePath);
      const document = new Document({
        filename: filePath.split('/').pop(),
        originalName: filePath.split('/').pop(),
        filePath: filePath,
        fileSize: stats.size,
        mimeType: 'application/pdf',
        uploadedBy: uploader,
        chunks: processedChunks,
        processingStatus: 'completed',
        documentType,
        category
      });
      await document.save();
      console.log(`✅ PDF processado e salvo: ${processedChunks.length} chunks`);
      return document;
    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      throw error;
    }
  }

  // Processar arquivo markdown estruturado
  async processMarkdown(filePath, uploadedBy) {
    try {
      const fs = require('fs');
      const mongoose = require('mongoose');
      const Document = require('../models/Document');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Dividir por artigos/seções principais
      const chunkRegex = /(^##+\s+.*$|^###\s+.*$|^Artigo\s+\d+º.*$)/gim;
      const splitIndices = [];
      let match;
      while ((match = chunkRegex.exec(content)) !== null) {
        splitIndices.push(match.index);
      }
      splitIndices.push(content.length);
      const chunks = [];
      for (let i = 0; i < splitIndices.length - 1; i++) {
        const chunk = content.substring(splitIndices[i], splitIndices[i + 1]).trim();
        if (chunk.length > 50) { // Ignorar pedaços muito pequenos
          chunks.push(chunk);
        }
      }
      // Gerar embeddings simples para cada chunk
      const processedChunks = chunks.map((chunk, index) => ({
        content: chunk,
        embedding: this.generateSimpleEmbedding(chunk),
        page: 1,
        chunkIndex: index,
        metadata: {
          keywords: this.extractKeywords(this.processText(chunk).tokens)
        }
      }));
      // Salvar no banco
      let uploader = uploadedBy;
      if (!mongoose.Types.ObjectId.isValid(uploadedBy)) {
        uploader = new mongoose.Types.ObjectId();
      }
      const stats = fs.statSync(filePath);
      const document = new Document({
        filename: filePath.split('/').pop(),
        originalName: filePath.split('/').pop(),
        filePath: filePath,
        fileSize: stats.size,
        mimeType: 'text/markdown',
        uploadedBy: uploader,
        chunks: processedChunks,
        processingStatus: 'completed',
        documentType: 'regulamento',
        category: 'geral'
      });
      await document.save();
      console.log(`✅ Markdown processado e salvo: ${processedChunks.length} chunks`);
      return document;
    } catch (error) {
      console.error('❌ Erro ao processar markdown:', error);
      throw error;
    }
  }

  // Chunking refinado: divide por artigo, parágrafo, lista ou bloco temático
  createChunks(text) {
    // 1. Dividir por artigos/seções principais
    const chunkHeaders = /(^##+\s+.*$|^###\s+.*$|^Artigo\s+\d+º?.*$)/gim;
    const splitIndices = [];
    let match;
    while ((match = chunkHeaders.exec(text)) !== null) {
      splitIndices.push(match.index);
    }
    splitIndices.push(text.length);
    const rawChunks = [];
    for (let i = 0; i < splitIndices.length - 1; i++) {
      const bloco = text.substring(splitIndices[i], splitIndices[i + 1]).trim();
      // 2. Dentro de cada bloco, dividir por parágrafo/lista
      const subBlocos = bloco.split(/\n\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
      for (const sub of subBlocos) {
        // 3. Se o subbloco for muito grande, dividir em até 500 caracteres, sem cortar frases
        if (sub.length <= 500) {
          rawChunks.push(sub);
        } else {
          let start = 0;
          while (start < sub.length) {
            let end = Math.min(start + 500, sub.length);
            if (end < sub.length) {
              const lastDot = sub.lastIndexOf('.', end);
              if (lastDot > start + 100) end = lastDot + 1;
            }
            rawChunks.push(sub.substring(start, end).trim());
            start = end;
          }
        }
      }
    }
    // Filtrar chunks muito pequenos
    return rawChunks.filter(c => c.length > 50);
  }
}

module.exports = new RAGService(); 