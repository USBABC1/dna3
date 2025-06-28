'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { Mic, Square, Volume2, Loader, ArrowLeft, Home } from 'lucide-react'
import { PERGUNTAS_DNA } from '@/lib/config'

type SessionStatus = 'idle' | 'listening' | 'waiting_for_user' | 'recording' | 'processing' | 'finished'

/**
 * Componente interno que usa useSearchParams
 */
function AnalysisContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [analysisStatus, setAnalysisStatus] = useState<SessionStatus>('idle')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])

  const audioRef = useRef<HTMLAudioElement>(null)

  // Redireciona se não autenticado ou sem sessionId
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && !sessionId) {
      router.push('/dashboard')
      return
    }
  }, [status, sessionId, router])

  // Inicializa o áudio quando a sessão estiver pronta
  useEffect(() => {
    if (session && sessionId) {
      initializeAudio()
    }
  }, [session, sessionId])

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data])
        }
      }

      setMediaRecorder(recorder)
      setAnalysisStatus('waiting_for_user')
    } catch (error) {
      console.error('Erro ao acessar microfone:', error)
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.')
    }
  }

  const playQuestionAudio = useCallback(async (questionIndex: number) => {
    const question = PERGUNTAS_DNA[questionIndex]
    if (!question?.audioUrl) {
      // Se não há áudio, apenas mostra a pergunta
      setAnalysisStatus('waiting_for_user')
      return
    }

    try {
      setIsAudioPlaying(true)
      setAnalysisStatus('listening')

      if (audioRef.current) {
        audioRef.current.src = question.audioUrl
        audioRef.current.onended = () => {
          setIsAudioPlaying(false)
          setAnalysisStatus('waiting_for_user')
        }
        audioRef.current.onerror = () => {
          console.log('Erro no áudio, continuando sem reprodução')
          setIsAudioPlaying(false)
          setAnalysisStatus('waiting_for_user')
        }
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error)
      setIsAudioPlaying(false)
      setAnalysisStatus('waiting_for_user')
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!mediaRecorder || mediaRecorder.state !== 'inactive') return

    try {
      setAudioChunks([])
      setTranscript('')
      setError(null)
      mediaRecorder.start()
      setAnalysisStatus('recording')
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      setError('Erro ao iniciar gravação')
    }
  }, [mediaRecorder])

  const stopRecording = useCallback(() => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') return

    setAnalysisStatus('processing')
    
    // Configura o handler para quando a gravação parar
    mediaRecorder.onstop = async () => {
      try {
        if (audioChunks.length === 0) {
          throw new Error('Nenhum áudio foi gravado')
        }
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await processAudioResponse(audioBlob)
      } catch (error) {
        console.error('Erro ao processar gravação:', error)
        setError('Erro ao processar sua resposta. Tente gravar novamente.')
        setAnalysisStatus('waiting_for_user')
      }
    }
    
    mediaRecorder.stop()
  }, [mediaRecorder, audioChunks, processAudioResponse])

  const processAudioResponse = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('sessionId', sessionId!)
      formData.append('questionIndex', currentQuestionIndex.toString())
      formData.append('questionText', PERGUNTAS_DNA[currentQuestionIndex]?.texto || '')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha na transcrição')
      }

      const data = await response.json()
      setTranscript(data.transcript)

      // Avança para a próxima pergunta após um breve delay
      setTimeout(() => {
        nextQuestion()
      }, 3000) // Aumentei o tempo para 3 segundos para dar tempo de ler

    } catch (error) {
      console.error('Erro no processamento:', error)
      setError(`Erro ao processar sua resposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`)
      setAnalysisStatus('waiting_for_user')
    }
  }

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1
    
    if (nextIndex < PERGUNTAS_DNA.length) {
      setCurrentQuestionIndex(nextIndex)
      setTranscript('')
      playQuestionAudio(nextIndex)
    } else {
      setAnalysisStatus('finished')
    }
  }

  const startAnalysis = () => {
    setCurrentQuestionIndex(0)
    setTranscript('')
    setError(null)
    playQuestionAudio(0)
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  const goHome = () => {
    router.push('/')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  if (!session || !sessionId) {
    return null
  }

  const currentQuestion = PERGUNTAS_DNA[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / PERGUNTAS_DNA.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={goToDashboard}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="DNA" className="w-8 h-8 rounded-full" />
                <h1 className="text-xl font-bold text-white">Análise DNA</h1>
              </div>
            </div>

            <button
              onClick={goHome}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      {analysisStatus !== 'idle' && analysisStatus !== 'finished' && (
        <div className="bg-black/20 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <span className="text-white/70 text-sm">
                Pergunta {currentQuestionIndex + 1} de {PERGUNTAS_DNA.length}
              </span>
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/70 text-sm">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analysisStatus === 'idle' && (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Pronto para começar?
              </h2>
              <p className="text-white/70 text-lg">
                Você será guiado através de {PERGUNTAS_DNA.length} perguntas para sua análise narrativa.
              </p>
            </div>

            <button
              onClick={startAnalysis}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 text-lg"
            >
              Iniciar Análise
            </button>
          </div>
        )}

        {analysisStatus === 'finished' && (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Análise Concluída!
              </h2>
              <p className="text-white/70 text-lg">
                Obrigado por participar. Sua análise foi salva com sucesso.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={goToDashboard}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Ver Dashboard
              </button>
              <button
                onClick={startAnalysis}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Nova Análise
              </button>
            </div>
          </div>
        )}

        {analysisStatus !== 'idle' && analysisStatus !== 'finished' && (
          <div className="space-y-8">
            {/* Question display */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">
                {currentQuestion?.texto}
              </h3>

              {/* Status indicator */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full ${
                  analysisStatus === 'listening' ? 'bg-blue-500 animate-pulse' :
                  analysisStatus === 'waiting_for_user' ? 'bg-green-500' :
                  analysisStatus === 'recording' ? 'bg-red-500 animate-pulse' :
                  analysisStatus === 'processing' ? 'bg-yellow-500 animate-pulse' :
                  'bg-gray-500'
                }`} />
                <span className="text-white/70">
                  {analysisStatus === 'listening' && 'Reproduzindo pergunta...'}
                  {analysisStatus === 'waiting_for_user' && 'Clique no microfone para responder'}
                  {analysisStatus === 'recording' && 'Gravando sua resposta...'}
                  {analysisStatus === 'processing' && 'Processando resposta...'}
                </span>
              </div>

              {/* Recording controls */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={analysisStatus === 'recording' ? stopRecording : startRecording}
                  disabled={analysisStatus === 'listening' || analysisStatus === 'processing'}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                    analysisStatus === 'recording'
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-orange-500 hover:bg-orange-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {analysisStatus === 'recording' ? (
                    <Square className="w-8 h-8 text-white" />
                  ) : analysisStatus === 'processing' ? (
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
                
                {/* Botão para pular pergunta */}
                {analysisStatus === 'waiting_for_user' && (
                  <button
                    onClick={nextQuestion}
                    className="text-white/60 hover:text-white text-sm underline transition-colors"
                  >
                    Pular pergunta
                  </button>
                )}
              </div>
            </div>

            {/* Transcript display */}
            {transcript && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Sua resposta:
                </h4>
                <p className="text-white/80 leading-relaxed">
                  {transcript}
                </p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-200">{error}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  )
}

/**
 * Página de análise interativa
 * Conduz o usuário através das perguntas da análise DNA
 */
export default function AnalysisPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando análise...</p>
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  )
}