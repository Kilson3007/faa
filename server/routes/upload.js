const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const ragService = require('../services/ragService');

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Manter nome original mas adicionar timestamp para evitar conflitos
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;
    cb(null, `${originalName}_${timestamp}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas PDFs
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos PDF são permitidos'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// Rota para upload de documento
router.post('/document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Processar o documento com RAG
    const result = await ragService.addDocument(filePath);

    if (result.success) {
      res.json({
        success: true,
        data: {
          message: 'Documento militar carregado com sucesso',
          fileName: fileName,
          filePath: filePath,
          stats: ragService.getDocumentStats()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no upload do documento'
    });
  }
});

// Rota para listar documentos carregados
router.get('/documents', (req, res) => {
  try {
    const stats = ragService.getDocumentStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar documentos'
    });
  }
});

// Rota para recarregar todos os documentos
router.post('/reload', async (req, res) => {
  try {
    const result = await ragService.loadDocuments();
    
    if (result) {
      res.json({
        success: true,
        data: {
          message: 'Documentos recarregados com sucesso',
          stats: ragService.getDocumentStats()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao recarregar documentos'
      });
    }
  } catch (error) {
    console.error('Erro ao recarregar documentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao recarregar documentos'
    });
  }
});

// Middleware de erro para multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 10MB'
      });
    }
  }
  
  if (error.message === 'Apenas arquivos PDF são permitidos') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

module.exports = router; 