import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Image, KeyboardAvoidingView, Platform, useWindowDimensions, TouchableOpacity, SafeAreaView, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import { chatService } from '../services/api';
import * as Speech from 'expo-speech';

const initialMessages = [
  // Array vazio - sem mensagem automática de boas-vindas
];

function cleanTTS(text: string) {
  // Remove conteúdo entre parênteses, asteriscos, sinais e símbolos desnecessários
  return text
    .replace(/\([^)]*\)/g, '') // remove tudo entre parênteses
    .replace(/[\*\_\#\|\[\]\{\}\^\~\`\$\%\@\=\+\<\>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/FAA/g, 'Fá') // Substitui "FAA" por "Fá" para correta pronúncia
    .trim();
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const flatListRef = useRef(null);
  const { width, height } = useWindowDimensions();

  // Log de vozes disponíveis
  useEffect(() => {
    Speech.getAvailableVoicesAsync().then(voices => {
      // console.log('Vozes disponíveis:', voices); // Removido para evitar poluição do terminal
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (!last.isUser && last.text && last.fromBackend && ttsEnabled) {
        speakText(last.text);
      }
    }
  }, [messages, ttsEnabled]);

  // Rolar para a última mensagem quando uma nova mensagem for adicionada
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Forçar FlatList a atualizar ao fechar o teclado
  useEffect(() => {
    const handleKeyboardHide = () => {
      if (flatListRef.current && flatListRef.current.scrollToEnd) {
        setTimeout(() => {
          flatListRef.current.scrollToEnd({ animated: false });
        }, 100);
      }
    };
    const sub = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
    return () => sub.remove();
  }, []);

  const speakText = (text: string) => {
    const cleanText = cleanTTS(text);
    if (cleanText) {
      Speech.speak(cleanText, {
        language: 'pt-PT',
        pitch: 1.0,
        rate: 1.2,
        voice: 'pt-pt-x-jmn-network'
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    console.log('[DEBUG] Enviando mensagem para o backend:', text);
    try {
      const response = await chatService.sendMessage(text);
      console.log('[DEBUG] Resposta recebida do backend:', response);
      if (response.success && response.data) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          isUser: false,
          timestamp: new Date(),
          fromBackend: true,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        Alert.alert('Erro', response.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.log('[DEBUG] Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Erro de conexão. Detalhe: ' + (error?.message || JSON.stringify(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAudio = async (audioBase64: string) => {
    setIsLoading(true);
    try {
      const response = await chatService.sendAudio(audioBase64, 'wav');
      if (response.success && response.data) {
        // Exibe o texto transcrito como mensagem do usuário
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: response.data.transcribedText,
            isUser: true,
            timestamp: new Date(),
          }
        ]);
        // Exibe a resposta do bot
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: response.data.message,
            isUser: false,
            timestamp: new Date(),
            fromBackend: true,
          }
        ]);
      } else {
        Alert.alert('Erro', response.error || 'Erro ao enviar áudio');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2d5016' }}>
      <LinearGradient
        colors={['#2d5016', '#4a5d23']}
        style={{
          paddingTop: height * 0.08,
          paddingBottom: height * 0.04,
          alignItems: 'center',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Image source={require('../../faa.png')} style={{ width: width * 0.12, height: width * 0.12, borderRadius: (width * 0.12) / 2, marginRight: width * 0.03, marginBottom: height * 0.01 }} />
          <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: Math.max(20, width * 0.055) }}>Chatbot das FAA</Text>
          <TouchableOpacity onPress={() => setTtsEnabled(v => !v)} style={{ marginLeft: 'auto', padding: 4 }}>
            <Text style={{ fontSize: 24, marginLeft: 10, color: ttsEnabled ? '#fff' : '#aaa' }}>
              {ttsEnabled ? '🔊' : '🔇'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: '#cccccc', fontSize: Math.max(13, width * 0.037) }}>
          Assistente de leis, normas e regulamentos militar
        </Text>
      </LinearGradient>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ChatMessage message={item} />
            )}
            contentContainerStyle={{ paddingHorizontal: width * 0.04, paddingVertical: 16 }}
            style={{ flex: 1 }}
          />
          <ChatInput onSendMessage={handleSendMessage} onSendAudio={handleSendAudio} isLoading={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d5016',
  },
  header: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerImage: {
    borderRadius: 17.5,
    marginRight: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    color: '#cccccc',
  },
  messagesContent: {
    paddingVertical: 16,
  },
  ttsButton: {
    marginLeft: 'auto',
    padding: 4,
  },
});

export default ChatScreen; 