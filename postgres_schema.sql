-- Script de criação do banco de dados chatbot_militar no PostgreSQL

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  military_id VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  rank VARCHAR(32) NOT NULL,
  unit VARCHAR(64) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  password VARCHAR(128) NOT NULL,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(256) NOT NULL,
  original_name VARCHAR(256) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(64),
  document_type VARCHAR(32),
  category VARCHAR(32),
  tags TEXT[],
  uploaded_by INTEGER REFERENCES users(id),
  processing_status VARCHAR(32),
  processing_error TEXT,
  statistics JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_chunks (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page INTEGER,
  chunk_index INTEGER,
  metadata JSONB,
  embeddings FLOAT8[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE question_histories (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding FLOAT8[],
  cluster INTEGER,
  source VARCHAR(32),
  metadata JSONB,
  statistics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(256),
  status VARCHAR(16),
  tags TEXT[],
  summary TEXT,
  statistics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  audio_url VARCHAR(512),
  context TEXT,
  metadata JSONB
); 