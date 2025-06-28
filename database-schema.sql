-- ====================================================================
-- SCHEMA DO BANCO DE DADOS - PLATAFORMA DNA
-- ====================================================================
-- Execute este script no SQL Editor do Supabase para configurar o banco

-- Habilita a extensão pgcrypto se ainda não estiver habilitada
-- UUIDs são mais seguros que IDs sequenciais para evitar enumeração
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TABELAS PRINCIPAIS
-- ====================================================================

-- Tabela para armazenar as sessões de análise de cada usuário
CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Referência ao usuário na tabela de autenticação do Supabase
    -- ON DELETE CASCADE garante limpeza automática quando usuário é removido
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Síntese final da análise (preenchida ao completar todas as perguntas)
    final_synthesis TEXT,
    -- Metadados adicionais (JSON flexível para futuras expansões)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela para armazenar cada resposta individual de uma sessão
CREATE TABLE user_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Referência à sessão (CASCADE para limpeza automática)
    session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE NOT NULL,
    -- Índice da pergunta na sequência (0-based)
    question_index INTEGER NOT NULL,
    -- Texto da pergunta (para histórico)
    question_text TEXT,
    -- Transcrição da resposta do usuário
    transcript_text TEXT,
    -- ID do arquivo de áudio no Google Drive
    audio_file_drive_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Metadados da resposta (confiança da transcrição, duração, etc.)
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índice para buscar sessões por usuário (query mais comum)
CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_created_at ON analysis_sessions(created_at DESC);

-- Índices para buscar respostas por sessão
CREATE INDEX idx_user_responses_session_id ON user_responses(session_id);
CREATE INDEX idx_user_responses_question_index ON user_responses(question_index);
CREATE INDEX idx_user_responses_created_at ON user_responses(created_at DESC);

-- Índice composto para ordenação de respostas dentro de uma sessão
CREATE INDEX idx_user_responses_session_question ON user_responses(session_id, question_index);

-- ====================================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Ativa RLS nas tabelas (proteção fundamental)
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- POLÍTICAS DE ACESSO
-- ====================================================================

-- ANÁLISE DE SESSÕES: Usuários podem ver apenas suas próprias sessões
CREATE POLICY "Users can view own analysis sessions"
ON analysis_sessions FOR SELECT 
USING (auth.uid() = user_id);

-- ANÁLISE DE SESSÕES: Usuários podem criar sessões para si mesmos
CREATE POLICY "Users can create own analysis sessions"
ON analysis_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ANÁLISE DE SESSÕES: Usuários podem atualizar suas próprias sessões
CREATE POLICY "Users can update own analysis sessions"
ON analysis_sessions FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RESPOSTAS: Usuários podem ver respostas de suas próprias sessões
CREATE POLICY "Users can view own responses"
ON user_responses FOR SELECT 
USING (
    auth.uid() = (
        SELECT user_id 
        FROM analysis_sessions 
        WHERE id = session_id
    )
);

-- RESPOSTAS: Usuários podem criar respostas em suas próprias sessões
CREATE POLICY "Users can create responses in own sessions"
ON user_responses FOR INSERT 
WITH CHECK (
    auth.uid() = (
        SELECT user_id 
        FROM analysis_sessions 
        WHERE id = session_id
    )
);

-- RESPOSTAS: Usuários podem atualizar suas próprias respostas
CREATE POLICY "Users can update own responses"
ON user_responses FOR UPDATE 
USING (
    auth.uid() = (
        SELECT user_id 
        FROM analysis_sessions 
        WHERE id = session_id
    )
)
WITH CHECK (
    auth.uid() = (
        SELECT user_id 
        FROM analysis_sessions 
        WHERE id = session_id
    )
);

-- ====================================================================
-- FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para obter estatísticas de um usuário
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_sessions BIGINT,
    total_responses BIGINT,
    completed_sessions BIGINT,
    first_session_date TIMESTAMPTZ,
    last_session_date TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(r.id) as total_responses,
        COUNT(DISTINCT s.id) FILTER (WHERE s.final_synthesis IS NOT NULL) as completed_sessions,
        MIN(s.created_at) as first_session_date,
        MAX(s.created_at) as last_session_date
    FROM analysis_sessions s
    LEFT JOIN user_responses r ON s.id = r.session_id
    WHERE s.user_id = user_uuid;
END;
$$;

-- Função para limpar sessões antigas incompletas (housekeeping)
CREATE OR REPLACE FUNCTION cleanup_incomplete_sessions(days_old INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analysis_sessions 
    WHERE final_synthesis IS NULL 
    AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ====================================================================
-- TRIGGERS PARA AUDITORIA E MANUTENÇÃO
-- ====================================================================

-- Função para atualizar timestamp de modificação
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adiciona coluna updated_at se necessário (para futuras atualizações)
-- ALTER TABLE analysis_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
-- CREATE TRIGGER update_analysis_sessions_updated_at BEFORE UPDATE ON analysis_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON TABLE analysis_sessions IS 'Sessões de análise narrativa dos usuários';
COMMENT ON COLUMN analysis_sessions.user_id IS 'Referência ao usuário autenticado';
COMMENT ON COLUMN analysis_sessions.final_synthesis IS 'Síntese final da análise (preenchida quando completa)';
COMMENT ON COLUMN analysis_sessions.metadata IS 'Dados adicionais em formato JSON';

COMMENT ON TABLE user_responses IS 'Respostas individuais dos usuários às perguntas da análise';
COMMENT ON COLUMN user_responses.question_index IS 'Índice da pergunta na sequência (0-based)';
COMMENT ON COLUMN user_responses.audio_file_drive_id IS 'ID do arquivo de áudio no Google Drive';
COMMENT ON COLUMN user_responses.metadata IS 'Metadados da resposta (confiança, duração, etc.)';

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================

-- Verifica se as tabelas foram criadas corretamente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_sessions') THEN
        RAISE EXCEPTION 'Tabela analysis_sessions não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_responses') THEN
        RAISE EXCEPTION 'Tabela user_responses não foi criada';
    END IF;
    
    RAISE NOTICE 'Schema do banco de dados configurado com sucesso!';
END $$;