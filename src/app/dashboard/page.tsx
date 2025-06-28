'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Play, LogOut, User, Calendar, FileText, Mic, Loader } from 'lucide-react'

interface AnalysisSession {
  id: string
  created_at: string
  final_synthesis?: string
  user_responses: Array<{
    id: string
    question_index: number
    question_text?: string
    transcript_text?: string
    created_at: string
  }>
}

/**
 * Dashboard principal da aplicação
 * Exibe o perfil do usuário, histórico de sessões e permite iniciar novas análises
 */
export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Carrega as sessões do usuário
  useEffect(() => {
    if (session) {
      loadSessions()
    }
  }, [session])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startNewSession = async () => {
    try {
      setIsCreatingSession(true)
      const response = await fetch('/api/sessions', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/analysis?sessionId=${data.sessionId}`)
      } else {
        console.error('Erro ao criar sessão')
      }
    } catch (error) {
      console.error('Erro ao iniciar nova sessão:', error)
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="DNA" className="w-8 h-8 rounded-full" />
              <h1 className="text-xl font-bold text-white">DNA</h1>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={session.user?.image || '/default-avatar.png'}
                  alt={session.user?.name || 'User'}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white font-medium">
                  {session.user?.name}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {session.user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-white/70">
            Gerencie suas sessões de análise narrativa e acompanhe seu progresso.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* New session card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Play className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Nova Análise</h3>
            </div>
            <p className="text-white/70 mb-4">
              Inicie uma nova sessão de análise narrativa profunda.
            </p>
            <button
              onClick={startNewSession}
              disabled={isCreatingSession}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingSession ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              {isCreatingSession ? 'Criando...' : 'Iniciar Análise'}
            </button>
          </div>

          {/* Stats cards */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Sessões</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{sessions.length}</p>
            <p className="text-white/70">Total de análises realizadas</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Perfil</h3>
            </div>
            <p className="text-white/70 mb-2">Membro desde</p>
            <p className="text-white font-medium">
              {session.user?.email && formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Sessions history */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Histórico de Sessões
            </h3>
          </div>

          <div className="p-6">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 mb-2">Nenhuma sessão encontrada</p>
                <p className="text-white/50 text-sm">
                  Inicie sua primeira análise para ver o histórico aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-medium">
                        Sessão #{session.id.slice(0, 8)}
                      </h4>
                      <span className="text-white/50 text-sm">
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span>{session.user_responses.length} respostas</span>
                      {session.final_synthesis && (
                        <span className="text-green-400">✓ Concluída</span>
                      )}
                    </div>

                    {session.final_synthesis && (
                      <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                        <p className="text-white/80 text-sm line-clamp-3">
                          {session.final_synthesis}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}