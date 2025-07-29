# 📁 Pasta de Uploads - Documentos Militares

Esta pasta é onde você deve colocar os documentos PDF militares para serem processados pelo sistema RAG.

## 📄 Tipos de Documentos Aceitos

- **Regulamentos Militares** (.pdf)
- **Leis das Forças Armadas** (.pdf)
- **Manuais de Instrução** (.pdf)
- **Portarias** (.pdf)
- **Normas e Procedimentos** (.pdf)

## 🚀 Como Usar

### Opção 1: Upload Manual
1. Coloque seus PDFs nesta pasta (`uploads/`)
2. O sistema RAG processará automaticamente na inicialização
3. Os documentos serão carregados no MongoDB

### Opção 2: Upload via API
```bash
curl -X POST http://localhost:3000/api/upload/document \
  -F "document=@seu_documento.pdf"
```

### Opção 3: Upload via Interface Web
- Acesse a rota de upload no navegador
- Arraste e solte os arquivos PDF

## 📋 Estrutura Recomendada

```
uploads/
├── regulamentos/
│   ├── regulamento_disciplinar.pdf
│   └── regulamento_geral.pdf
├── leis/
│   ├── lei_organica.pdf
│   └── estatuto_militares.pdf
├── manuais/
│   ├── manual_instrucao.pdf
│   └── procedimentos.pdf
└── outros/
    └── documentos_varios.pdf
```

## ⚠️ Importante

- **Apenas arquivos PDF** são aceitos
- **Tamanho máximo**: 10MB por arquivo
- **Processamento**: Pode demorar alguns segundos
- **Backup**: Mantenha cópias dos originais

## 🔍 Verificar Processamento

Após adicionar documentos, verifique:

```bash
# Verificar status
curl http://localhost:3000/api/rag/stats

# Verificar documentos
curl http://localhost:3000/api/upload/documents
```

## 🎯 Exemplos de Documentos Militares

- Regulamento Disciplinar do Exército
- Estatuto dos Militares
- Lei Orgânica das Forças Armadas
- Manual de Campanha
- Instruções Gerais
- Portarias Ministeriais

---

**Coloque seus documentos PDF aqui e o sistema RAG fará o resto!** 🎖️ 