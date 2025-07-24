import axios from 'axios';
import { ChatResponse, AudioResponse } from '../types';

const API_BASE_URL = 'http://192.168.1.159:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  async sendMessage(message: string, userId?: string): Promise<ChatResponse> {
    try {
      const response = await api.post('/chat/message', {
        message,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: 'Erro ao enviar mensagem'
      };
    }
  },

  async sendAudio(audioData: string, audioFormat: string = 'wav'): Promise<AudioResponse> {
    try {
      const response = await api.post('/chat/audio', {
        audioData,
        audioFormat
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar áudio:', error);
      return {
        success: false,
        error: 'Erro ao enviar áudio'
      };
    }
  },

  async getTTS(text: string) {
    try {
      const response = await api.post('/chat/tts', { text });
      return response.data;
    } catch (error) {
      console.error('Erro na geração de voz:', error);
      return {
        success: false,
        error: 'Erro na geração de voz'
      };
    }
  }
};

export const ragService = {
  async getStats() {
    try {
      const response = await api.get('/rag/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        error: 'Erro ao obter estatísticas'
      };
    }
  },

  async searchContext(query: string, limit: number = 3) {
    try {
      const response = await api.post('/rag/search', { query, limit });
      return response.data;
    } catch (error) {
      console.error('Erro na busca de contexto:', error);
      return {
        success: false,
        error: 'Erro na busca de contexto'
      };
    }
  }
};

export const uploadService = {
  async uploadDocument(file: any) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: 'Erro no upload do documento'
      };
    }
  },

  async getDocuments() {
    try {
      const response = await api.get('/upload/documents');
      return response.data;
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      return {
        success: false,
        error: 'Erro ao listar documentos'
      };
    }
  }
};

export default api; 