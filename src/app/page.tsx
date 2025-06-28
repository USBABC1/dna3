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
    <div className="main-container">
      <FloatingParticles />
      <DottedLines />
      <Logo />
      
      <div className="content-area">
        <div className="content-flex">
          <div style={{ flex: 1 }}>
            <h1 className="question-text">
              DNA<br />
              Deep Narrative Analysis<br />
              <span className="question-highlight">UP</span> LANÇAMENTOS
            </h1>
            
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '2rem',
              maxWidth: '500px'
            }}>
              Plataforma avançada de análise narrativa que utiliza inteligência artificial 
              para compreender e mapear padrões profundos em suas respostas.
            </p>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              maxWidth: '400px'
            }}>
              {/* Botão de login principal */}
              <button
                onClick={handleLogin}
                disabled={status === 'loading'}
                style={{
                  background: 'linear-gradient(135deg, var(--primary-orange), var(--secondary-orange))',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 107, 53, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <LogIn className="w-5 h-5" />
                {status === 'loading' ? 'Carregando...' : 'Login com Google'}
              </button>

              {/* Botão de acesso como convidado */}
              <button
                onClick={handleGuestAccess}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Play className="w-5 h-5" />
                Experimentar sem Login
              </button>
            </div>

            {/* Informações sobre benefícios do login */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              maxWidth: '500px'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Benefícios do Login:
              </h3>
              <ul style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li>✓ Histórico completo de suas análises</li>
                <li>✓ Dados salvos com segurança</li>
                <li>✓ Acesso aos arquivos de áudio</li>
                <li>✓ Relatórios detalhados</li>
              </ul>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div className="mic-button" style={{ cursor: 'default' }}>
              <Mic className="mic-icon" />
            </div>
            <AudioVisualizer isActive={false} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
