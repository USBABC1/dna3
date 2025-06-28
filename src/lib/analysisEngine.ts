// src/lib/analysisEngine.ts

import { ExpertProfile, Pergunta, ValorSchwartz, BigFive, Motivador } from './types'

// --- INÍCIO DA CORREÇÃO DEFINITIVA ---
// 1. Definimos um tipo explícito para a estrutura do nosso objeto de palavras-chave.
// Usamos o tipo `Record` para dizer ao TypeScript que estes objetos são dicionários
// que usam nossos tipos (BigFive, ValorSchwartz, etc.) como chaves.
type KeyWords = {
  bigFive: Record<BigFive, string[]>;
  schwartz: Record<ValorSchwartz, string[]>;
  motivators: Record<Motivador, string[]>;
};
// --- FIM DA CORREÇÃO DEFINITIVA ---

// 2. Aplicamos o tipo `KeyWords` ao nosso objeto.
const keyWords: KeyWords = {
  bigFive: {
    Openness: ['imaginação', 'arte', 'emoções', 'aventura', 'ideias', 'curiosidade', 'experiência', 'criatividade', 'novo', 'diferente', 'viagem'],
    Conscientiousness: ['organização', 'disciplina', 'dever', 'responsabilidade', 'planejamento', 'foco', 'meta', 'objetivo', 'trabalho', 'eficiência'],
    Extraversion: ['social', 'amigos', 'festa', 'energia', 'pessoas', 'interação', 'comunicação', 'externo', 'entusiasmo'],
    Agreeableness: ['compaixão', 'cooperação', 'confiança', 'empatia', 'ajudar', 'harmonia', 'gentileza', 'amável'],
    Neuroticism: ['ansiedade', 'medo', 'preocupação', 'estresse', 'insegurança', 'nervosismo', 'tristeza', 'raiva', 'instabilidade'],
  },
  schwartz: {
    'Self-Direction': ['liberdade', 'independência', 'criatividade', 'explorar', 'curiosidade', 'autonomia', 'escolha'],
    Stimulation: ['desafio', 'excitação', 'novidade', 'aventura', 'intenso', 'risco'],
    Hedonism: ['prazer', 'diversão', 'alegria', 'satisfação', 'gratificação'],
    Achievement: ['sucesso', 'ambição', 'realização', 'competência', 'influência', 'reconhecimento'],
    Power: ['autoridade', 'riqueza', 'poder', 'controle', 'domínio', 'prestígio'],
    Security: ['segurança', 'ordem', 'estabilidade', 'proteção', 'família', 'limpeza'],
    Conformity: ['regras', 'disciplina', 'obediência', 'respeito', 'tradição', 'normas'],
    Tradition: ['tradição', 'costumes', 'respeito', 'religião', 'moderação', 'humildade'],
    Benevolence: ['ajuda', 'honestidade', 'perdão', 'lealdade', 'amizade', 'amor', 'cuidado'],
    Universalism: ['justiça', 'igualdade', 'paz', 'natureza', 'sabedoria', 'proteção', 'mundo'],
  },
  motivators: {
    Purpose: ['propósito', 'significado', 'missão', 'causa', 'impacto', 'legado', 'contribuição'],
    Autonomy: ['autonomia', 'liberdade', 'independência', 'controle', 'flexibilidade', 'escolha'],
    Mastery: ['maestria', 'habilidade', 'competência', 'desenvolvimento', 'aprender', 'crescimento', 'domínio'],
    Connection: ['conexão', 'relacionamento', 'comunidade', 'pertencer', 'intimidade', 'laços'],
  },
};


export function analisarFragmento(texto: string, perfil: ExpertProfile, pergunta: Pergunta): ExpertProfile {
  const textoLowerCase = texto.toLowerCase();

  if (pergunta.dominio) {
    perfil.coberturaDominios[pergunta.dominio] = (perfil.coberturaDominios[pergunta.dominio] || 0) + 1;
  }

  const countKeywords = (words: string[]) => {
    return words.reduce((acc, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = textoLowerCase.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);
  };
  
  // Agora, com o `keyWords` devidamente tipado, os loops funcionarão sem erros.
  (Object.keys(keyWords.bigFive) as BigFive[]).forEach((trait) => {
    const score = countKeywords(keyWords.bigFive[trait]);
    perfil.bigFive[trait] += score;
  });

  (Object.keys(keyWords.schwartz) as ValorSchwartz[]).forEach((value) => {
    const score = countKeywords(keyWords.schwartz[value]);
    perfil.valoresSchwartz[value] += score;
  });

  (Object.keys(keyWords.motivators) as Motivador[]).forEach((motivator) => {
    const score = countKeywords(keyWords.motivators[motivator]);
    perfil.motivadores[motivator] += score;
  });

  if (textoLowerCase.includes(' mas ') || textoLowerCase.includes(' porém ') || textoLowerCase.includes(' embora ') || textoLowerCase.includes(' contudo ')) {
    perfil.metricas.contradicoes += 1;
    perfil.conflitosDeValorDetectados.push(`Conflito potencial na resposta à pergunta: "${pergunta.texto}"`);
  }

  const metaforasBasicas = ['farol', 'ponte', 'montanha', 'rio', 'esponja', 'rocha', 'labirinto', 'jardim'];
  metaforasBasicas.forEach(metafora => {
    if (textoLowerCase.includes(metafora)) {
      perfil.metricas.metaforas += 1;
      if (!perfil.metaforasCentrais.includes(metafora)) {
        perfil.metaforasCentrais.push(metafora);
      }
    }
  });

  return perfil;
}


export function gerarSinteseFinal(perfil: ExpertProfile): string {
  const encontrarMaiorValor = (obj: Record<string, number>) => {
    return Object.entries(obj).reduce((a, b) => (b[1] > a[1] ? b : a), ['', -1])[0] || 'Nenhum dominante';
  };

  const principalMotivador = encontrarMaiorValor(perfil.motivadores);
  const principalValor = encontrarMaiorValor(perfil.valoresSchwartz);

  const formatarHierarquia = (obj: Record<string, number>) => {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  let cartaEspelho = `Prezado(a) Analisado(a),\n\nCom base em sua jornada narrativa, emerge um perfil centrado no valor de **${principalValor}** e impulsionado pelo motivador da **${principalMotivador}**. Suas palavras pintam um quadro de alguém que busca ativamente... [desenvolvimento da síntese]`;

  let relatorioFinal = `
=========================================
RELATÓRIO DE ANÁLISE NARRATIVA PROFUNDA
=========================================

**PERFIL:** DNA Expert Profile

### CARTA ESPELHO

${cartaEspelho}

---

### MÉTRICAS NARRATIVAS

- **Metáforas Centrais Identificadas:** ${perfil.metaforasCentrais.join(', ') || 'Nenhuma'}
- **Contradições Lógicas (indicadores de conflito):** ${perfil.metricas.contradicoes}

---

### HIERARQUIA DE VALORES (MODELO DE SCHWARTZ)

A seguir, a ressonância de cada valor em sua narrativa:
${formatarHierarquia(perfil.valoresSchwartz)}

---

### HIERARQUIA DE MOTIVADORES

Seus principais impulsionadores de ação:
${formatarHierarquia(perfil.motivadores)}

---

### PERFIL DE PERSONALIDADE (BIG FIVE)

Seus traços de personalidade predominantes:
${formatarHierarquia(perfil.bigFive)}

---

### CONFLITOS DE VALOR DETECTADOS

Momentos em que a narrativa sugeriu tensão interna:
- ${perfil.conflitosDeValorDetectados.slice(0, 5).join('\n- ') || 'Nenhum conflito evidente detectado.'}

---

### COBERTURA DE DOMÍNIOS DA VIDA

Áreas exploradas durante a sessão:
${formatarHierarquia(perfil.coberturaDominios)}

=========================================
FIM DO RELATÓRIO
=========================================
  `;

  return relatorioFinal;
}
