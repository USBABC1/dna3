import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para uso no frontend (com chave anônima)
// Esta chave é segura para ser exposta no frontend pois as políticas RLS protegem os dados
// Em desenvolvimento, usa valores placeholder se as variáveis não estiverem configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Supabase para uso no backend (com chave de serviço)
// Esta chave tem privilégios administrativos e só deve ser usada em funções serverless
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Tipos TypeScript para as tabelas do banco de dados
export interface AnalysisSession {
  id: string
  user_id: string
  created_at: string
  final_synthesis?: string
}

export interface UserResponse {
  id: string
  session_id: string
  question_index: number
  question_text?: string
  transcript_text?: string
  audio_file_drive_id: string
  created_at: string
}

// Tipo para o banco de dados completo
export interface Database {
  public: {
    Tables: {
      analysis_sessions: {
        Row: AnalysisSession
        Insert: Omit<AnalysisSession, 'id' | 'created_at'>
        Update: Partial<Omit<AnalysisSession, 'id' | 'created_at'>>
      }
      user_responses: {
        Row: UserResponse
        Insert: Omit<UserResponse, 'id' | 'created_at'>
        Update: Partial<Omit<UserResponse, 'id' | 'created_at'>>
      }
    }
  }
}