'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LogIn, Mic, Play } from 'lucide-react'

// Componente para partículas flutuantes
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'normal' : 'small',
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 10
  }));

  return (
    <div className="floating-particles">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle ${particle.size}`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
    </div>
  );
};

// Componente para linhas pontilhadas decorativas
const DottedLines = () => (
  <>
    <div 
      className="dotted-line" 
      style={{ 
        top: '15%', 
        left: '10%', 
        width: '200px',
        transform: 'rotate(-15deg)' 
      }} 
    />
    <div 
      className="dotted-line" 
      style={{ 
        top: '60%', 
        right: '15%', 
        width: '150px',
        transform: 'rotate(25deg)' 
      }} 
    />
    <div 
      className="dotted-line" 
      style={{ 
        bottom: '20%', 
        left: '5%', 
        width: '180px',
        transform: 'rotate(-8deg)' 
      }} 
    />
  </>
);

// Componente do visualizador de áudio
const AudioVisualizer = ({ isActive }: { isActive: boolean }) => {
  const bars = Array.from({ length: 40 }, (_, i) => i);
  
  return (
    <div className="audio-visualizer">
      {bars.map((bar, index) => {
        const height = isActive 
          ? Math.random() * 80 + 20 
          : Math.sin(index * 0.3) * 20 + 30;
        
        return (
          <div
            key={bar}
            className={`audio-bar ${isActive ? 'active' : ''}`}
            style={{
              '--bar-height': `${height}px`,
              height: isActive ? `${height}px` : '8px',
              animationDelay: `${index * 0.05}s`
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

// Componente do indicador de progresso circular
const ProgressIndicator = ({ current, total }: { current: number; total: number }) => {
  const percentage = (current / total) * 100;
  const circumference = 2 * Math.PI * 26; // raio = 26
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-container">
      <div className="progress-circle">
        <svg width="60" height="60">
          <circle
            className="progress-bg"
            cx="30"
            cy="30"
            r="26"
          />
          <circle
            className="progress-fill"
            cx="30"
            cy="30"
            r="26"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
          {current}/{total}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Perguntas
        </div>
      </div>
    </div>
  );
};

// Componente do logo
const Logo = () => (
  <div className="logo-container">
    <img 
      src="/logo.png" 
      alt="Logo" 
      className="logo-image"
    />
  </div>
);

// Componente do rodapé
const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <p>DNA</p>
      <p>Deep Narrative Analysis - UP LANÇAMENTOS 2025</p>
    </div>
  </footer>
);

/**
 * Página inicial da plataforma DNA
 * Apresenta a plataforma e oferece opções de login ou acesso direto
 */
export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redireciona usuários autenticados para o dashboard
  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleGuestAccess = () => {
    // Para acesso como convidado, redireciona para a versão original
    router.push('/guest-analysis')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <FloatingParticles />
      <DottedLines />
      
      {/* Header com logo */}
      <header className="relative z-20 p-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DNA" className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold text-white">DNA</h1>
            <p className="text-white/60 text-sm">Deep Narrative Analysis</p>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Lado esquerdo - Conteúdo */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                DNA<br />
                Deep Narrative Analysis<br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
                  UP LANÇAMENTOS
                </span>
              </h2>
              
              <p className="text-white/80 text-lg leading-relaxed max-w-lg">
                Plataforma avançada de análise narrativa que utiliza inteligência artificial 
                para compreender e mapear padrões profundos em suas respostas.
              </p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-4 max-w-md">
              <button
                onClick={handleLogin}
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
              >
                <LogIn className="w-5 h-5" />
                {status === 'loading' ? 'Carregando...' : 'Login com Google'}
              </button>

              <button
                onClick={handleGuestAccess}
                className="w-full bg-transparent border-2 border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" />
                Experimentar sem Login
              </button>
            </div>

            {/* Benefícios do login */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 max-w-md">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Benefícios do Login:
              </h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Histórico completo de suas análises
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Dados salvos com segurança
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Acesso aos arquivos de áudio
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Relatórios detalhados
                </li>
              </ul>
            </div>
          </div>
          
          {/* Lado direito - Visualização */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30">
                <Mic className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-ping opacity-20"></div>
            </div>
            <AudioVisualizer isActive={false} />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-20 text-center py-6 border-t border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="text-white/60 text-sm">
          <p className="font-semibold text-orange-400 mb-1">DNA</p>
          <p>Deep Narrative Analysis - UP LANÇAMENTOS 2025</p>
        </div>
      </footer>
    </div>
  )
}
