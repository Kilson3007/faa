const client = require('../services/postgresService');

/**
 * Modelo simplificado para compatibilizar chamadas existentes em ragService.
 * Salva o documento e seus chunks nas tabelas `documents` e `document_chunks` do PostgreSQL.
 */
class Document {
  constructor(data) {
    // Copiamos todas as propriedades diretamente
    Object.assign(this, data);
  }

  /**
   * Persiste o documento e seus chunks.
   * Retorna um objeto com o id gerado e demais campos úteis para logging.
   */
  async save() {
    // Inserir documento principal
    const res = await client.query(
      `INSERT INTO documents (
        filename, original_name, file_path, file_size, mime_type,
        document_type, category, uploaded_by, processing_status, statistics
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        this.filename,
        this.originalName || this.filename,
        this.filePath,
        this.fileSize || 0,
        this.mimeType,
        this.documentType || 'outro',
        this.category || 'geral',
        null, // uploaded_by – não estamos rastreando usuário por enquanto
        this.processingStatus || 'completed',
        JSON.stringify(this.statistics || {})
      ]
    );

    const documentId = res.rows[0].id;

    // Inserir chunks, se existirem
    if (Array.isArray(this.chunks) && this.chunks.length > 0) {
      for (const chunk of this.chunks) {
        // Garante que embeddings sejam numéricos (float8[])
        const embeddings = (chunk.embedding || []).map(v =>
          typeof v === 'boolean' ? (v ? 1 : 0) : v
        );

        await client.query(
          `INSERT INTO document_chunks (
            document_id, content, page, chunk_index, metadata, embeddings
          ) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            documentId,
            chunk.content,
            chunk.page || 1,
            chunk.chunkIndex || 0,
            JSON.stringify(chunk.metadata || {}),
            embeddings
          ]
        );
      }
    }

    // Retorna info básica para quem chamou
    return { id: documentId, filename: this.filename, totalChunks: this.chunks?.length || 0 };
  }
}

module.exports = Document; 