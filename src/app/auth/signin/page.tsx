'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Loader } from 'lucide-react'

/**
 * Página de login personalizada
 * Oferece uma experiência de login limpa e profissional com Google OAuth
 */
function SignInContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Captura erros da URL
  const urlError = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  // Verifica se o usuário já está logado e configura erros da URL
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
    
    // Define erro baseado na URL
    if (urlError) {
      switch (urlError) {
        case 'Callback':
          setError('Erro de configuração OAuth. Verifique: 1) NEXTAUTH_URL no Netlify (sem duplo https://), 2) URLs de redirecionamento no Google Cloud Console (/api/auth/callback/google), 3) Client ID e Secret corretos.')
          break
        case 'OAuthSignin':
          setError('Erro ao iniciar o processo de login.')
          break
        case 'OAuthCallback':
          setError('Erro no callback do OAuth. Verifique as URLs de redirecionamento.')
          break
        case 'OAuthCreateAccount':
          setError('Erro ao criar conta.')
          break
        case 'EmailCreateAccount':
          setError('Erro ao criar conta com email.')
          break
        case 'Signin':
          setError('Erro no processo de login.')
          break
        case 'OAuthAccountNotLinked':
          setError('Esta conta já está vinculada a outro provedor.')
          break
        case 'EmailSignin':
          setError('Erro ao enviar email de login.')
          break
        case 'CredentialsSignin':
          setError('Credenciais inválidas.')
          break
        case 'SessionRequired':
          setError('Sessão necessária.')
          break
        default:
          setError(`Erro de autenticação: ${urlError}`)
      }
    }
  }, [router, urlError])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await signIn('google', {
        callbackUrl: callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError('Erro ao fazer login. Tente novamente.')
        console.error('Erro no login:', result.error)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error('Erro no processo de login:', error)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-particles">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="particle small"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card de login */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img 
                src="/logo.png" 
                alt="DNA Logo" 
                className="w-16 h-16 mx-auto rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              DNA
            </h1>
            <p className="text-white/70 text-lg">
              Deep Narrative Analysis
            </p>
            <p className="text-white/50 text-sm mt-2">
              Faça login para acessar sua análise
            </p>
          </div>

          {/* Botão de login com Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? 'Conectando...' : 'Continuar com Google'}
          </button>

          {/* Mensagem de erro */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {/* Informações de segurança */}
          <div className="mt-6 text-center text-white/50 text-xs">
            <p>Ao fazer login, você concorda com nossos</p>
            <p>Termos de Uso e Política de Privacidade</p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 text-center text-white/40 text-sm">
          <p>Plataforma segura e criptografada</p>
          <p>Seus dados são protegidos</p>
        </div>
      </div>
    </div>
  )
}

export default function SignIn(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Carregando página de login...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}