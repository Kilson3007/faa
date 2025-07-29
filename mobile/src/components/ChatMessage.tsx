import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Message } from '../types';
import { militaryTheme, shadows } from '../utils/theme';

interface ChatMessageProps {
  message: Message;
  onPress?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onPress }) => {
  const isUser = message.isUser;
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer, { paddingHorizontal: width * 0.04 }]}>
      <TouchableOpacity 
        style={[styles.messageContainer, { maxWidth: width * 0.8 }]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4a5d23', '#2d5016']}
          style={[
            styles.messageBubble, 
            isUser ? styles.userBubble : styles.botBubble, 
            { padding: width * 0.03 }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText, { fontSize: Math.max(14, width * 0.04) }]}>
            {message.text}
          </Text>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp, { fontSize: Math.max(10, width * 0.03) }]}>
            {message.timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    // maxWidth será definido dinamicamente
  },
  messageBubble: {
    borderRadius: 16,
    ...shadows.medium,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: militaryTheme.text,
  },
  botText: {
    color: militaryTheme.text,
  },
  timestamp: {
    opacity: 0.7,
  },
  userTimestamp: {
    color: militaryTheme.textSecondary,
    textAlign: 'right',
  },
  botTimestamp: {
    color: militaryTheme.textSecondary,
    textAlign: 'left',
  },
});

export default ChatMessage; 