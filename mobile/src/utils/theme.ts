import { MilitaryTheme } from '../types';

export const militaryTheme: MilitaryTheme = {
  primary: '#2d5016',      // Verde militar escuro
  secondary: '#4a5d23',    // Verde militar médio
  accent: '#8b4513',       // Marrom militar
  background: '#1a1a1a',   // Preto militar
  surface: '#2a2a2a',      // Cinza escuro
  text: '#ffffff',         // Branco
  textSecondary: '#cccccc' // Cinza claro
};

export const gradients = {
  primary: ['#2d5016', '#4a5d23'],
  secondary: ['#4a5d23', '#8b4513'],
  background: ['#1a1a1a', '#2a2a2a'],
  surface: ['#2a2a2a', '#3a3a3a']
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12
  }
}; 