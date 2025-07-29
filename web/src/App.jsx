import React, { useState, useRef, useEffect } from 'react';

const API_URL = '/api/chat/message';

const theme = {
  background: '#2d5016',
  input: '#4a5d23',
  bot: '#8b4513',
  user: '#1a1a1a',
  text: '#fff',
  border: '#2a2a2a',
  accent: '#f5c542',
};

// Função para buscar a voz 'pt-pt-x-jmn-network' ou pt-PT
function getPortugueseVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  // Procurar exatamente 'pt-pt-x-jmn-network'
  let ptVoice = voices.find(v => v.voiceURI === 'pt-pt-x-jmn-network');
  if (!ptVoice) ptVoice = voices.find(v => v.lang === 'pt-PT');
  return ptVoice || null;
}

// Dicionário de pronúncias especiais
const PRONUNCIATION_MAP = [
  { regex: /\bFAA\b/g, replacement: 'fá' },
  // Adicione outras substituições aqui, exemplo:
  // { regex: /\bXYZ\b/g, replacement: 'xis ípsilon zê' },
];

<<<<<<< HEAD
// Função para remover símbolos especiais e formatação Markdown indesejada (melhorada para preservar pontuação válida)
function removeSimbolos(text) {
  let cleanedText = text;
  // Remove cabeçalhos Markdown (ex: ### Artigo 13º)
  cleanedText = cleanedText.replace(/#{1,}\s*Artigo\s*\d+º\s*\(.*?\)\s*\n?/g, '');
  // Remove blocos de código (```text ... ```)
  cleanedText = cleanedText.replace(/```text[\s\S]*?```\n?/g, '');
=======
// Função para remover símbolos especiais (melhorada para preservar pontuação válida)
function removeSimbolos(text) {
  let cleanedText = text;
>>>>>>> 2558089a4cf88e8b76387127c4ed9dc0cfdf7d6a
  // Substitui sequências de 2 ou mais pontos de interrogação por um único ponto de interrogação
  cleanedText = cleanedText.replace(/\?{2,}/g, '?');
  // Substitui sequências de 2 ou mais vírgulas por uma única vírgula
  cleanedText = cleanedText.replace(/,{2,}/g, ',');
  // Substitui sequências de 2 ou mais outros símbolos problemáticos (identificados anteriormente) por um único
<<<<<<< HEAD
  cleanedText = cleanedText.replace(/([*@\$%&!^]){2,}/g, '$1');
  // Remove caracteres de nova linha indesejados que podem vir do backend
  cleanedText = cleanedText.replace(/\r/g, '');
  // Remove asteriscos soltos que não fazem parte de formatação específica (e que não sejam de regex como já temos)
  cleanedText = cleanedText.replace(/\*/g, '');
=======
  cleanedText = cleanedText.replace(/([*#@\$%&!^]){2,}/g, '$1');
  // Remove caracteres de nova linha indesejados que podem vir do backend
  cleanedText = cleanedText.replace(/\r/g, '');
>>>>>>> 2558089a4cf88e8b76387127c4ed9dc0cfdf7d6a
  return cleanedText;
}

function applyPronunciationMap(text) {
  let result = text;
  for (const { regex, replacement } of PRONUNCIATION_MAP) {
    result = result.replace(regex, replacement);
  }
  // Remover símbolos especiais, agora de forma mais inteligente para TTS e exibição
  result = removeSimbolos(result);
  return result;
}

function speak(text, setTtsError) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    let voice = getPortugueseVoice();
    if (!voice) {
      setTtsError('Nenhuma voz "pt-PT" encontrada no seu navegador. Instale uma voz PT-PT nas configurações do sistema.');
      return;
    }
    setTtsError('');
    // Aplicar dicionário de pronúncias especiais
    const cleanText = applyPronunciationMap(text);
    const utter = new window.SpeechSynthesisUtterance(cleanText);
    utter.voice = voice;
    utter.lang = 'pt-PT';
    utter.pitch = 1.0;
    utter.rate = 1.2; // Reduzido para uma leitura mais natural
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  } else {
    setTtsError('Seu navegador não suporta síntese de voz (TTS).');
  }
}

function ChatMessage({ message }) {
  return (
    <div style={{
      alignSelf: message.isUser ? 'flex-end' : 'flex-start',
      background: message.isUser ? theme.user : theme.bot,
      color: theme.text,
      borderRadius: 16,
      padding: '14px 20px',
      margin: '8px 0',
      maxWidth: '85%',
      boxShadow: '0 2px 12px #0002',
      fontSize: 17,
      lineHeight: 1.6,
      wordBreak: 'break-word',
      border: message.isUser ? `2px solid ${theme.accent}` : 'none',
      transition: 'background 0.2s, border 0.2s',
      boxSizing: 'border-box',
    }}>
      {removeSimbolos(message.text)}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Bem-vindo ao Chatbot das FAA! Pergunte sobre disciplina, deveres, punições, etc.', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const chatRef = useRef(null);
  const lastBotMsgRef = useRef('');
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Carregar vozes ao iniciar
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => setVoicesLoaded(true);
      setVoicesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Falar automaticamente a última resposta do bot se áudio estiver ligado
  useEffect(() => {
    if (audioOn && messages.length > 0 && voicesLoaded) {
      const last = messages[messages.length - 1];
      if (!last.isUser && last.text !== lastBotMsgRef.current) {
        setTimeout(() => speak(last.text, setTtsError), 100);
        lastBotMsgRef.current = last.text;
      }
    }
    // eslint-disable-next-line
  }, [messages, audioOn, voicesLoaded]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, isUser: true };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.message) {
        setMessages(msgs => [...msgs, { text: data.data.message, isUser: false }]);
      } else {
        setMessages(msgs => [...msgs, { text: 'Erro ao obter resposta do servidor.', isUser: false }]);
      }
    } catch (e) {
      setMessages(msgs => [...msgs, { text: 'Erro de conexão com o servidor.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{
      minHeight: '100vh',
      minWidth: '100vw',
      background: theme.background,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 700,
        margin: '0 auto',
        background: 'rgba(44, 70, 22, 0.98)',
        borderRadius: 22,
        boxShadow: '0 6px 32px #0005',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 600,
        height: '90vh',
        maxHeight: 900,
        marginTop: 32,
        marginBottom: 32,
        border: `2px solid ${theme.accent}`,
        transition: 'max-width 0.2s',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 28, marginBottom: 10 }}>
          <img src="/faa.png" alt="Logo FAA" style={{ width: 90, borderRadius: 18, boxShadow: '0 2px 8px #0003' }} />
          <button
            onClick={() => setAudioOn(a => !a)}
            title={audioOn ? 'Desligar áudio' : 'Ligar áudio'}
            style={{
              background: audioOn ? theme.accent : theme.input,
              color: audioOn ? '#222' : theme.text,
              border: 'none',
              borderRadius: 14,
              fontSize: 32,
              padding: '10px 18px',
              cursor: 'pointer',
              boxShadow: audioOn ? '0 2px 8px #f5c54288' : '0 1px 4px #0002',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            {audioOn ? <span role="img" aria-label="áudio ligado">🔊</span> : <span role="img" aria-label="áudio desligado">🔈</span>}
          </button>
        </div>
        <h2 style={{ color: theme.text, marginTop: 8, marginBottom: 0, textAlign: 'center', fontWeight: 700, letterSpacing: 1, fontSize: 30 }}>Chatbot das FAA</h2>
        {ttsError && (
          <div style={{ color: '#fff', background: '#b00', padding: 8, borderRadius: 8, margin: '8px 32px', textAlign: 'center', fontWeight: 500, fontSize: 15 }}>
            {ttsError}
          </div>
        )}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 350,
          maxHeight: 'calc(90vh - 180px)',
          boxSizing: 'border-box',
          margin: '20px 0 0 0',
          padding: '0 0 8px 0',
          overflow: 'hidden',
        }}>
          <div
            ref={chatRef}
            style={{
              flex: 1,
              width: '100%',
              background: '#fff1',
              borderRadius: 16,
              padding: 24,
              overflowY: 'auto',
              boxShadow: '0 2px 12px #0003',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {messages.map((msg, i) => <ChatMessage key={i} message={msg} />)}
            {loading && <div style={{ color: theme.text, marginTop: 8 }}>Respondendo...</div>}
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              gap: 12,
              padding: 20,
              boxSizing: 'border-box',
              marginBottom: 0,
              background: 'rgba(44, 70, 22, 0.98)',
              borderBottomLeftRadius: 22,
              borderBottomRightRadius: 22,
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
            }}
          >
            <input
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 10,
                border: `1.5px solid ${theme.border}`,
                background: theme.input,
                color: theme.text,
                fontSize: 18,
                outline: 'none',
                fontWeight: 500,
                boxSizing: 'border-box',
              }}
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              style={{
                padding: '16px 32px',
                borderRadius: 10,
                background: theme.bot,
                color: theme.text,
                border: 'none',
                fontWeight: 'bold',
                fontSize: 18,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 1px 4px #0002',
                transition: 'background 0.2s',
              }}
              onClick={sendMessage}
              disabled={loading}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
