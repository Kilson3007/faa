# 📋 Instruções de Instalação - Chatbot Militar

## ⚠️ IMPORTANTE: Node.js Necessário

O Node.js foi instalado mas pode precisar de reinicialização do sistema. Após reiniciar o computador, continue com os passos abaixo.

## 🚀 Passos de Instalação

### 1. Verificar Node.js
```bash
node --version
npm --version
```

### 2. Instalar Dependências do Backend
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
copy .env.example .env

# Editar o arquivo .env e adicionar sua chave da API Gemini
# GEMINI_API_KEY=sua_chave_aqui
```

### 4. Instalar Dependências do Mobile
```bash
cd mobile
npm install
cd ..
```

### 5. Criar Pasta de Uploads
```bash
mkdir uploads
```

## 🔑 Obter Chave da API Gemini

1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada
5. Cole no arquivo `.env`:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```

## 🏃‍♂️ Executar o Projeto

### Backend (Terminal 1)
```bash
npm run dev
```

### Mobile (Terminal 2)
```bash
cd mobile
npm start
```

## 📱 Testar no Dispositivo

1. Instale o Expo Go no seu celular
2. Escaneie o QR code que aparece no terminal
3. O app será carregado automaticamente

## 📄 Adicionar Documentos Militares

1. Coloque seus PDFs na pasta `uploads/`
2. O sistema RAG processará automaticamente
3. Ou use a API: `POST /api/upload/document`

## 🎨 Características do App

- **Tema Militar**: Cores das fardas (verde, marrom, preto)
- **Chat por Voz**: Grave e ouça mensagens
- **IA Especializada**: Respostas baseadas em regulamentos militares
- **Busca Inteligente**: RAG para encontrar informações relevantes

## 🐛 Solução de Problemas

### Node.js não encontrado
- Reinicie o computador após instalação
- Verifique se está no PATH do sistema

### Erro de dependências
```bash
npm cache clean --force
npm install
```

### Erro de conexão mobile
- Verifique se o backend está rodando
- Confirme o IP no arquivo `mobile/src/services/api.ts`

## 📞 Suporte

Se encontrar problemas, verifique:
1. Node.js instalado e funcionando
2. Chave da API Gemini válida
3. Backend rodando na porta 3000
4. Dispositivo conectado na mesma rede

---

**Desenvolvido para as Forças Armadas** 🎖️ 