export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    timestamp: string;
    context?: string;
  };
  error?: string;
}

export interface AudioResponse {
  success: boolean;
  data?: {
    transcribedText: string;
    message: string;
    timestamp: string;
  };
  error?: string;
}

export interface User {
  id: string;
  name: string;
  rank?: string;
  unit?: string;
}

export interface MilitaryTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
} 