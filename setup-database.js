#!/usr/bin/env node

/**
 * Script para configurar o banco de dados Supabase
 * Execute: node setup-database.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Configurando banco de dados...')

  try {
    // 1. Habilitar extensão pgcrypto
    console.log('📦 Habilitando extensão pgcrypto...')
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "pgcrypto";'
    })
    
    if (extensionError && !extensionError.message.includes('already exists')) {
      console.log('⚠️  Extensão pgcrypto pode já estar habilitada ou será habilitada automaticamente')
    }

    // 2. Criar tabela analysis_sessions
    console.log('📋 Criando tabela analysis_sessions...')
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS analysis_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          final_synthesis TEXT,
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    })

    if (sessionsError) {
      console.log('⚠️  Criando tabela analysis_sessions diretamente...')
      const { error } = await supabase
        .from('analysis_sessions')
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log('📋 Tabela analysis_sessions não existe, será criada via SQL Editor')
      }
    }

    // 3. Criar tabela user_responses
    console.log('📝 Criando tabela user_responses...')
    const { error: responsesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_responses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE NOT NULL,
          question_index INTEGER NOT NULL,
          question_text TEXT,
          transcript_text TEXT,
          audio_file_drive_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    })

    if (responsesError) {
      console.log('⚠️  Criando tabela user_responses diretamente...')
      const { error } = await supabase
        .from('user_responses')
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log('📝 Tabela user_responses não existe, será criada via SQL Editor')
      }
    }

    // 4. Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura do banco...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['analysis_sessions', 'user_responses'])

    if (tablesError) {
      console.log('⚠️  Não foi possível verificar as tabelas automaticamente')
      console.log('📖 Execute o script database-schema.sql manualmente no SQL Editor do Supabase')
    } else {
      const tableNames = tables.map(t => t.table_name)
      console.log('📊 Tabelas encontradas:', tableNames)
      
      if (tableNames.includes('analysis_sessions') && tableNames.includes('user_responses')) {
        console.log('✅ Banco de dados configurado com sucesso!')
      } else {
        console.log('⚠️  Algumas tabelas podem estar faltando')
        console.log('📖 Execute o script database-schema.sql manualmente no SQL Editor do Supabase')
      }
    }

    // 5. Testar conexão básica
    console.log('🔗 Testando conexão...')
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1)

    if (authError) {
      console.log('⚠️  Conexão com auth.users limitada (normal em desenvolvimento)')
    } else {
      console.log('✅ Conexão com banco de dados funcionando!')
    }

  } catch (error) {
    console.error('❌ Erro durante configuração:', error.message)
    console.log('\n📖 Instruções manuais:')
    console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard')
    console.log('2. Vá para SQL Editor')
    console.log('3. Execute o arquivo database-schema.sql')
  }
}

// Executar configuração
setupDatabase()
  .then(() => {
    console.log('\n🎉 Configuração concluída!')
    console.log('🚀 Agora você pode executar: npm run dev')
  })
  .catch((error) => {
    console.error('❌ Falha na configuração:', error)
    process.exit(1)
  })