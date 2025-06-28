import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

/**
 * API Route para gerenciar sessões de análise
 * POST: Cria uma nova sessão de análise para o usuário autenticado
 * GET: Lista as sessões do usuário autenticado
 */

export async function POST(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const session = await getServerSession(authOptions)
    
    console.log('Session debug:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    })
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado', debug: { hasSession: !!session, hasUser: !!session?.user } },
        { status: 401 }
      )
    }

    // Cria uma nova sessão de análise usando o ID do usuário da sessão
    const { data: sessionData, error: sessionError } = await supabase
      .from('analysis_sessions')
      .insert({
        user_id: session.user.id,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError)
      return NextResponse.json(
        { error: 'Falha ao criar sessão de análise' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sessionId: sessionData.id,
      message: 'Sessão criada com sucesso'
    })

  } catch (error) {
    console.error('Erro interno na criação de sessão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verifica se o usuário está autenticado
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Lista as sessões do usuário usando o ID da sessão
    const { data: sessions, error: sessionsError } = await supabase
      .from('analysis_sessions')
      .select(`
        id,
        created_at,
        final_synthesis,
        user_responses (
          id,
          question_index,
          question_text,
          transcript_text,
          created_at
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.error('Erro ao buscar sessões:', sessionsError)
      return NextResponse.json(
        { error: 'Falha ao buscar sessões' },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessions })

  } catch (error) {
    console.error('Erro interno na busca de sessões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}