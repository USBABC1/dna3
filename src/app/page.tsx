'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Volume2, Loader } from 'lucide-react';
import { PERGUNTAS_DNA, criarPerfilInicial } from '../lib/config';
import { analisarFragmento, gerarSinteseFinal } from '../lib/analysisEngine';
import { initAudio, playAudioFromUrl, startRecording, stopRecording } from '../services/webAudioService';
import type { ExpertProfile, SessionStatus, Pergunta } from '../lib/types';

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

// Componente principal da interface
export default function DnaInterface() {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
  const [perfil, setPerfil] = useState<ExpertProfile>(criarPerfilInicial());
  const [error, setError] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const perguntaIndex = useRef(0);

  useEffect(() => {
    initAudio().catch(err => {
      console.error("Erro ao inicializar áudio:", err);
      setError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    });
  }, []);

  const iniciarSessao = useCallback(() => {
    perguntaIndex.current = 0;
    setPerfil(criarPerfilInicial());
    setError(null);
    fazerProximaPergunta();
  }, []);
  
  const fazerProximaPergunta = useCallback(async () => {
    if (perguntaIndex.current < PERGUNTAS_DNA.length) {
      const pergunta = PERGUNTAS_DNA[perguntaIndex.current];
      setPerguntaAtual(pergunta);
      setStatus('listening');
      setIsAudioPlaying(true);
      
      try {
        await playAudioFromUrl(pergunta.audioUrl, () => {
          setStatus('waiting_for_user');
          setIsAudioPlaying(false);
        });
        perguntaIndex.current++;
      } catch (err) {
        console.error("Erro ao reproduzir áudio:", err);
        setError("Erro ao reproduzir a pergunta. Tentando novamente...");
        setTimeout(fazerProximaPergunta, 2000);
      }
    } else {
      setStatus('finished');
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
      setStatus('recording');
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      setError("Não foi possível iniciar a gravação. Verifique as permissões do microfone.");
    }
  }, []);
  
  const handleStopRecording = useCallback(async () => {
    setStatus('processing');
    try {
      const audioBlob = await stopRecording();
      const transcricao = await transcreverAudio(audioBlob);
      if (perguntaAtual) {
        const perfilAtualizado = analisarFragmento(transcricao, perfil, perguntaAtual);
        setPerfil(perfilAtualizado);
      }
      fazerProximaPergunta();
    } catch (err) {
      console.error("Erro ao processar gravação:", err);
      setError("Problema ao processar sua resposta. Continuando para a próxima pergunta...");
      setTimeout(fazerProximaPergunta, 2000);
    }
  }, [perguntaAtual, perfil, fazerProximaPergunta]);

  const transcreverAudio = async (audioBlob: Blob): Promise<string> => {
    const response = await fetch('/api/transcribe', { method: 'POST', body: audioBlob });
    if (!response.ok) throw new Error("Falha na transcrição");
    const data = await response.json();
    return data.transcript;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          text: 'Reproduzindo pergunta...',
          dotClass: 'listening'
        };
      case 'waiting_for_user':
        return {
          text: 'Clique no microfone para responder',
          dotClass: 'waiting'
        };
      case 'recording':
        return {
          text: 'Gravando sua resposta...',
          dotClass: 'recording'
        };
      case 'processing':
        return {
          text: 'Processando resposta...',
          dotClass: 'processing'
        };
      default:
        return {
          text: 'Pronto para começar',
          dotClass: ''
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatQuestionText = (text: string) => {
    // Destaca palavras-chave importantes
    const keywords = ['você', 'sua', 'seu', 'quem', 'qual', 'como', 'onde', 'quando', 'por que'];
    let formattedText = text;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formattedText = formattedText.replace(regex, `<span class="question-highlight">${keyword}</span>`);
    });
    
    return formattedText;
  };

  if (status === 'idle') {
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
              
              <button
                onClick={iniciarSessao}
                style={{
                  background: 'linear-gradient(135deg, var(--primary-orange), var(--secondary-orange))',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                Iniciar Análise DNA
              </button>
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
    );
  }

  if (status === 'finished') {
    return (
      <div className="main-container">
        <FloatingParticles />
        <Logo />
        
        <div className="content-area">
          <div style={{ 
            maxWidth: '800px', 
            width: '100%',
            textAlign: 'center'
          }}>
            <h1 className="question-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Análise <span className="question-highlight">Concluída</span>
            </h1>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'var(--text-secondary)',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {gerarSinteseFinal(perfil)}
              </pre>
            </div>
            
            <button
              onClick={iniciarSessao}
              style={{
                background: 'linear-gradient(135deg, var(--primary-orange), var(--secondary-orange))',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Nova Análise
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-container">
      <FloatingParticles />
      <DottedLines />
      <Logo />
      
      <ProgressIndicator 
        current={perguntaIndex.current} 
        total={PERGUNTAS_DNA.length} 
      />
      
      <div className="content-area">
        <div className="content-flex">
          <div style={{ flex: 1 }}>
            <div className="status-indicator">
              <div className={`status-dot ${statusConfig.dotClass}`} />
              <span className="status-text">{statusConfig.text}</span>
            </div>
            
            <h1 
              className="question-text"
              dangerouslySetInnerHTML={{ 
                __html: perguntaAtual ? formatQuestionText(perguntaAtual.texto) : '' 
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: '2rem'
          }}>
            <button
              className={`mic-button ${status === 'recording' ? 'recording' : ''} ${
                status === 'listening' || status === 'processing' ? 'disabled' : ''
              }`}
              onClick={status === 'recording' ? handleStopRecording : handleStartRecording}
              disabled={status === 'listening' || status === 'processing'}
            >
              {status === 'recording' ? (
                <Square className="mic-icon" />
              ) : status === 'processing' ? (
                <Loader className="mic-icon" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Mic className="mic-icon" />
              )}
            </button>
            
            <AudioVisualizer isActive={isAudioPlaying || status === 'recording'} />
          </div>
        </div>
      </div>
      
      <Footer />
      
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 68, 68, 0.9)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
