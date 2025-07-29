--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conversas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversas (
    id integer NOT NULL,
    user_id integer,
    title character varying(256),
    status character varying(16),
    tags text[],
    summary text,
    statistics jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_messages (
    id integer NOT NULL,
    conversation_id integer,
    text text NOT NULL,
    is_user boolean NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    audio_url character varying(512),
    context text,
    metadata jsonb
);


--
-- Name: mensagens_conversa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensagens_conversa (
    id integer NOT NULL,
    conversation_id integer,
    text text NOT NULL,
    is_user boolean NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    audio_url character varying(512),
    context text,
    metadata jsonb
);


--
-- Name: conversation_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversation_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversation_messages_id_seq OWNED BY public.mensagens_conversa.id;


--
-- Name: conversation_messages_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversation_messages_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_messages_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversation_messages_id_seq1 OWNED BY public.conversation_messages.id;


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    user_id integer,
    title character varying(256),
    status character varying(16),
    tags text[],
    summary text,
    statistics jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversas.id;


--
-- Name: conversations_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq1 OWNED BY public.conversations.id;


--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_chunks (
    id integer NOT NULL,
    document_id integer,
    content text NOT NULL,
    page integer,
    chunk_index integer,
    metadata jsonb,
    embeddings double precision[],
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fragmentos_documento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fragmentos_documento (
    id integer NOT NULL,
    document_id integer,
    content text NOT NULL,
    page integer,
    chunk_index integer,
    metadata jsonb,
    embeddings double precision[],
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: document_chunks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_chunks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_chunks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.document_chunks_id_seq OWNED BY public.fragmentos_documento.id;


--
-- Name: document_chunks_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_chunks_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_chunks_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.document_chunks_id_seq1 OWNED BY public.document_chunks.id;


--
-- Name: documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos (
    id integer NOT NULL,
    filename character varying(256) NOT NULL,
    original_name character varying(256) NOT NULL,
    file_path character varying(512) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(64),
    document_type character varying(32),
    category character varying(32),
    tags text[],
    uploaded_by integer,
    processing_status character varying(32),
    processing_error text,
    statistics jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    filename character varying(256) NOT NULL,
    original_name character varying(256) NOT NULL,
    file_path character varying(512) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(64),
    document_type character varying(32),
    category character varying(32),
    tags text[],
    uploaded_by integer,
    processing_status character varying(32),
    processing_error text,
    statistics jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documentos.id;


--
-- Name: documents_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq1 OWNED BY public.documents.id;


--
-- Name: historico_perguntas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historico_perguntas (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    embedding double precision[],
    cluster integer,
    source character varying(32),
    metadata jsonb,
    statistics jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    times_asked integer DEFAULT 1
);


--
-- Name: question_histories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_histories (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    embedding double precision[],
    cluster integer,
    source character varying(32),
    metadata jsonb,
    statistics jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: question_histories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.question_histories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_histories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.question_histories_id_seq OWNED BY public.historico_perguntas.id;


--
-- Name: question_histories_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.question_histories_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_histories_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.question_histories_id_seq1 OWNED BY public.question_histories.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    military_id character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    rank character varying(32) NOT NULL,
    unit character varying(64) NOT NULL,
    email character varying(128) NOT NULL,
    password character varying(128) NOT NULL,
    permissions text[],
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    preferences jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(100),
    nip character varying(100),
    numero_telemovel character varying(20)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.usuarios.id;


--
-- Name: users_id_seq1; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq1 OWNED BY public.users.id;


--
-- Name: conversas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversas ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: conversation_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages ALTER COLUMN id SET DEFAULT nextval('public.conversation_messages_id_seq1'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq1'::regclass);


--
-- Name: document_chunks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_chunks ALTER COLUMN id SET DEFAULT nextval('public.document_chunks_id_seq1'::regclass);


--
-- Name: documentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq1'::regclass);


--
-- Name: fragmentos_documento id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fragmentos_documento ALTER COLUMN id SET DEFAULT nextval('public.document_chunks_id_seq'::regclass);


--
-- Name: historico_perguntas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_perguntas ALTER COLUMN id SET DEFAULT nextval('public.question_histories_id_seq'::regclass);


--
-- Name: mensagens_conversa id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensagens_conversa ALTER COLUMN id SET DEFAULT nextval('public.conversation_messages_id_seq'::regclass);


--
-- Name: question_histories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_histories ALTER COLUMN id SET DEFAULT nextval('public.question_histories_id_seq1'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq1'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: mensagens_conversa conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensagens_conversa
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey1 PRIMARY KEY (id);


--
-- Name: conversas conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey1 PRIMARY KEY (id);


--
-- Name: fragmentos_documento document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fragmentos_documento
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (id);


--
-- Name: document_chunks document_chunks_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey1 PRIMARY KEY (id);


--
-- Name: documentos documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey1 PRIMARY KEY (id);


--
-- Name: historico_perguntas question_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historico_perguntas
    ADD CONSTRAINT question_histories_pkey PRIMARY KEY (id);


--
-- Name: question_histories question_histories_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_histories
    ADD CONSTRAINT question_histories_pkey1 PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_military_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_military_id_key UNIQUE (military_id);


--
-- Name: usuarios users_nip_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT users_nip_key UNIQUE (nip);


--
-- Name: usuarios users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey1 PRIMARY KEY (id);


--
-- Name: mensagens_conversa conversation_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensagens_conversa
    ADD CONSTRAINT conversation_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversas(id) ON DELETE CASCADE;


--
-- Name: conversation_messages conversation_messages_conversation_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_conversation_id_fkey1 FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversas conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id);


--
-- Name: conversations conversations_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: fragmentos_documento document_chunks_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fragmentos_documento
    ADD CONSTRAINT document_chunks_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documentos(id) ON DELETE CASCADE;


--
-- Name: document_chunks document_chunks_document_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_document_id_fkey1 FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: documentos documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.usuarios(id);


--
-- Name: documents documents_uploaded_by_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey1 FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

