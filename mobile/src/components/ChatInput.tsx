import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Keyboard, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

// O ChatInput apenas grava e envia o áudio para o backend. Não há transcrição local ou dependência de Speech-to-Text externo.

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio: (audioBase64: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendAudio, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permissão de áudio é necessária para gravar.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert(
        'Limitação do Expo Go',
        'A gravação de áudio só funciona em builds customizadas (APK/IPA). No Expo Go, esta função não está disponível.'
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        onSendAudio(base64Audio);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível parar a gravação.');
    }
  };

  const handleRecordingPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <LinearGradient
      colors={['#2a2a2a', '#1a1a1a']}
      style={{ 
        padding: width * 0.04, 
        borderRadius: 20,
        marginTop: width * 0.02,
        marginLeft: width * 0.02,
        marginRight: width * 0.02,
        marginBottom: insets.bottom + 2,
        paddingBottom: 8
      }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <TextInput
        style={{ 
          color: '#fff', 
          backgroundColor: '#333', 
          borderRadius: 8, 
          padding: width * 0.03, 
          marginBottom: width * 0.02,
          minHeight: Math.max(50, height * 0.06),
          textAlignVertical: 'top',
          fontSize: Math.max(14, width * 0.035)
        }}
        value={message}
        onChangeText={setMessage}
        placeholder="Digite sua mensagem..."
        placeholderTextColor="#aaa"
        editable={!isLoading}
        multiline={true}
      />
      <View style={{ flexDirection: 'row', gap: width * 0.03 }}>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#4a5d23', 
            padding: width * 0.025, 
            borderRadius: 8,
            flex: 1
          }} 
          onPress={handleSendMessage} 
          disabled={!message.trim() || isLoading}
        >
          <Text style={{ 
            color: '#fff', 
            textAlign: 'center',
            fontSize: Math.max(14, width * 0.035)
          }}>
            {isLoading ? '⏳' : 'Enviar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ 
            backgroundColor: isRecording ? '#ff4444' : '#8b4513', 
            padding: width * 0.025, 
            borderRadius: 8,
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }} 
          onPress={handleRecordingPress}
        >
          <Text style={{ 
            color: '#fff', 
            fontSize: Math.max(18, width * 0.045)
          }}>
            {isRecording ? '⏹️' : '🎙️'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ChatInput; 