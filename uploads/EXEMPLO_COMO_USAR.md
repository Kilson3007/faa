# 📋 Guia Prático - Como Usar a Pasta Uploads

## 🎯 **Passo a Passo**

### 1. **Preparar Documentos**
```
📁 Seus PDFs Militares:
├── regulamento_disciplinar.pdf
├── estatuto_militares.pdf
├── manual_campanha.pdf
└── portaria_2024.pdf
```

### 2. **Organizar na Pasta**
```
📁 uploads/
├── 📁 regulamentos/
│   └── 📄 regulamento_disciplinar.pdf
├── 📁 leis/
│   └── 📄 estatuto_militares.pdf
├── 📁 manuais/
│   └── 📄 manual_campanha.pdf
└── 📁 outros/
    └── 📄 portaria_2024.pdf
```

### 3. **Iniciar o Sistema**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Mobile
cd mobile
npm start
```

### 4. **Verificar Processamento**
```bash
# Verificar se os documentos foram processados
curl http://localhost:3000/api/rag/stats
```

## 🔍 **Exemplo de Resposta**

```json
{
  "success": true,
  "data": {
    "totalDocuments": 4,
    "totalChunks": 156,
    "sources": [
      "regulamento_disciplinar.pdf",
      "estatuto_militares.pdf",
      "manual_campanha.pdf",
      "portaria_2024.pdf"
    ],
    "databaseStats": {
      "totalDocuments": 4,
      "totalChunks": 156,
      "totalSizeMB": 2.5
    }
  }
}
```

## 🧪 **Testar o Chat**

### Pergunta de Exemplo:
```
"Qual a penalidade para indisciplina militar?"
```

### Resposta Esperada:
```
"Baseado no Regulamento Disciplinar do Exército, Artigo 45, 
a indisciplina é punida com:

1. Advertência verbal
2. Repreensão
3. Detenção disciplinar
4. Prisão disciplinar

A gravidade da penalidade depende da natureza da indisciplina..."
```

## ⚡ **Dicas Importantes**

### ✅ **Fazer**
- Usar PDFs de boa qualidade
- Organizar por categorias
- Verificar se foram processados
- Testar com perguntas específicas

### ❌ **Não Fazer**
- Colocar arquivos não-PDF
- Usar PDFs muito grandes (>10MB)
- Misturar documentos não-militares
- Esquecer de verificar o processamento

## 🚨 **Solução de Problemas**

### Documento não aparece
```bash
# Verificar se foi processado
curl http://localhost:3000/api/upload/documents

# Reprocessar se necessário
curl -X POST http://localhost:3000/api/rag/initialize
```

### Erro de processamento
```bash
# Verificar logs do servidor
# Verificar tamanho do arquivo
# Verificar se é PDF válido
```

### Chat não responde
```bash
# Verificar se há documentos carregados
curl http://localhost:3000/api/rag/stats

# Verificar conexão com Gemini
curl http://localhost:3000/api/health
```

## 🎖️ **Documentos Recomendados**

### **Essenciais**
- [ ] Regulamento Disciplinar do Exército
- [ ] Estatuto dos Militares
- [ ] Lei Orgânica das Forças Armadas

### **Complementares**
- [ ] Manual de Campanha
- [ ] Instruções Gerais
- [ ] Portarias Recentes

---

**Agora você pode colocar seus documentos PDF e testar o chatbot!** 🚀 