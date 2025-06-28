import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Debug endpoint para verificar o estado da sessão
 * Útil para diagnosticar problemas de autenticação
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          image: session.user?.image,
        },
        expires: session.expires,
      } : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 })
  }
}