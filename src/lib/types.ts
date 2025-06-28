// src/lib/types.ts

// Interface para uma única pergunta
export interface Pergunta {
  texto: string;
  audioUrl: string;
  dominio: string; 
}

// Interface para as métricas do Big Five
export interface BigFiveMetrics {
  [key: string]: number;
  Openness: number;
  Conscientiousness: number;
  Extraversion: number;
  Agreeableness: number;
  Neuroticism: number;
}

// Interface para os valores de Schwartz
export interface SchwartzValues {
  [key: string]: number;
  'Self-Direction': number;
  Stimulation: number;
  Hedonism: number;
  Achievement: number;
  Power: number;
  Security: number;
  Conformity: number;
  Tradition: number;
  Benevolence: number;
  Universalism: number;
}

// Interface para os motivadores primários
export interface PrimaryMotivators {
  [key: string]: number;
  Purpose: number;
  Autonomy: number;
  Mastery: number;
  Connection: number;
}

// Tipos para as chaves das métricas
export type BigFive = keyof BigFiveMetrics;
export type ValorSchwartz = keyof SchwartzValues;
export type Motivador = keyof PrimaryMotivators;

// A estrutura principal que armazena todo o perfil do expert
export interface ExpertProfile {
  bigFive: BigFiveMetrics;
  valoresSchwartz: SchwartzValues;
  motivadores: PrimaryMotivators;
  coberturaDominios: {
    [key: string]: number;
  };
  metricas: {
    contradicoes: number;
    metaforas: number;
  };
  metaforasCentrais: string[];
  conflitosDeValorDetectados: string[];
}

// Define os possíveis estados da sessão para controlar a UI
export type SessionStatus =
  | 'idle'
  | 'listening'
  | 'waiting_for_user'
  | 'recording'
  | 'processing'
  | 'finished';
