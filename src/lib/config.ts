// src/lib/config.ts

import { Pergunta, ExpertProfile } from './types';

// A lista de perguntas foi completamente atualizada com base na sua última entrada.
export const PERGUNTAS_DNA: Pergunta[] = [
  // Domínio 1: Identidade
  { texto: "Olá. Bem-vindo ao DNA, Deep Narrative Analysis. Uma jornada interativa de autoanálise através da sua narrativa. Vamos começar.", audioUrl: "/audio/000.mp3", dominio: "Identidade" },
  { texto: "Quem é você além dos crachás que carrega?", audioUrl: "/audio/001.mp3", dominio: "Identidade" },
  { texto: "Se sua vida fosse um livro, qual seria o título atual deste capítulo?", audioUrl: "/audio/002.mp3", dominio: "Identidade" },
  { texto: "Que versão anterior de você ainda habita dentro da atual?", audioUrl: "/audio/003.mp3", dominio: "Identidade" },
  { texto: "Qual parte de você permanece constante, independente do contexto?", audioUrl: "/audio/004.mp3", dominio: "Identidade" },
  { texto: "Que papel você interpreta que não se alinha com quem realmente é?", audioUrl: "/audio/005.mp3", dominio: "Identidade" },
  { texto: "Se pudesse reescrever uma página de sua história, qual seria e como a modificaria?", audioUrl: "/audio/006.mp3", dominio: "Identidade" },
  { texto: "Qual verdade sobre você é simultaneamente falsa?", audioUrl: "/audio/007.mp3", dominio: "Identidade" },
  { texto: "Em que momento você é mais autêntico e também mais performático?", audioUrl: "/audio/008.mp3", dominio: "Identidade" },
  { texto: "O que você evita admitir sobre si mesmo?", audioUrl: "/audio/009.mp3", dominio: "Identidade" },
  { texto: "O que as pessoas mais erram sobre quem você é?", audioUrl: "/audio/010.mp3", dominio: "Identidade" },
  { texto: "Como você descreveria seu 'eu futuro' em três palavras?", audioUrl: "/audio/011.mp3", dominio: "Identidade" },
  { texto: "O que sua intimidade silenciosa diria sobre você?", audioUrl: "/audio/012.mp3", dominio: "Identidade" },
  
  // Domínio 2: Valores
  { texto: "O que permaneceria intocável se tudo ruísse ao redor?", audioUrl: "/audio/013.mp3", dominio: "Valores" },
  { texto: "Qual princípio você defende mesmo quando custa algo a você?", audioUrl: "/audio/014.mp3", dominio: "Valores" },
  { texto: "O que você se recusa a negociar, mesmo quando seria vantajoso?", audioUrl: "/audio/015.mp3", dominio: "Valores" },
  { texto: "Quais valores seus foram herdados e quais foram conquistados?", audioUrl: "/audio/016.mp3", dominio: "Valores" },
  { texto: "Que valor você admira nos outros mas luta para incorporar?", audioUrl: "/audio/017.mp3", dominio: "Valores" },
  { texto: "Em que situação seus valores entram em conflito entre si?", audioUrl: "/audio/018.mp3", dominio: "Valores" },
  { texto: "Qual valor você defende publicamente mas viola em privado?", audioUrl: "/audio/019.mp3", dominio: "Valores" },
  { texto: "O que você valoriza que também te aprisiona?", audioUrl: "/audio/020.mp3", dominio: "Valores" },
  { texto: "Como seus valores influenciam sua rotina diária?", audioUrl: "/audio/021.mp3", dominio: "Valores" },
  { texto: "Que valor você priorizaria se fosse seu mentor de 20 anos atrás?", audioUrl: "/audio/022.mp3", dominio: "Valores" },
  { texto: "Qual valor seu mais surpreende quando se olha no espelho?", audioUrl: "/audio/023.mp3", dominio: "Valores" },
  { texto: "Que princípio seu tem sido testado recentemente — e como reagiu?", audioUrl: "/audio/024.mp3", dominio: "Valores" },

  // Domínio 3: Crenças Sobre Si
  { texto: "Que história interna você conta sobre 'ser suficiente'?", audioUrl: "/audio/025.mp3", dominio: "CrencasSobreSi" },
  { texto: "Que limite autoimposto você suspeita que seja ilusório?", audioUrl: "/audio/026.mp3", dominio: "CrencasSobreSi" },
  { texto: "O que você acredita ser incapaz de fazer que pode ser apenas medo?", audioUrl: "/audio/027.mp3", dominio: "CrencasSobreSi" },
  { texto: "Que qualidade você tem dificuldade em reconhecer em si mesmo?", audioUrl: "/audio/028.mp3", dominio: "CrencasSobreSi" },
  { texto: "Qual habilidade sua é tão natural que você subestima seu valor?", audioUrl: "/audio/029.mp3", dominio: "CrencasSobreSi" },
  { texto: "Que potencial em você permanece adormecido por autocensura?", audioUrl: "/audio/030.mp3", dominio: "CrencasSobreSi" },
  { texto: "Em que aspecto você é simultaneamente seu maior aliado e sabotador?", audioUrl: "/audio/031.mp3", dominio: "CrencasSobreSi" },
  { texto: "Que verdade sobre si mesmo você sabe intelectualmente, mas não sente emocionalmente?", audioUrl: "/audio/032.mp3", dominio: "CrencasSobreSi" },
  { texto: "Que narrativa sua sobre 'não merecimento' você carrega de longos anos?", audioUrl: "/audio/033.mp3", dominio: "CrencasSobreSi" },
  { texto: "Como você explicaria seu 'eu mais confiante' a si mesmo?", audioUrl: "/audio/034.mp3", dominio: "CrencasSobreSi" },
  { texto: "Onde seu perfeccionismo já arruinou um momento importante?", audioUrl: "/audio/035.mp3", dominio: "CrencasSobreSi" },
  { texto: "Que fase da vida foi a primeira em que você se sentiu 'totalmente você'?", audioUrl: "/audio/036.mp3", dominio: "CrencasSobreSi" },

  // Domínio 4: Relacionamentos
  { texto: "O que o mundo parece estar lhe dizendo repetidamente?", audioUrl: "/audio/037.mp3", dominio: "Relacionamentos" },
  { texto: "Qual padrão você percebe nas pessoas que entram em sua vida?", audioUrl: "/audio/038.mp3", dominio: "Relacionamentos" },
  { texto: "Que regra não escrita você acredita que governa as interações humanas?", audioUrl: "/audio/039.mp3", dominio: "Relacionamentos" },
  { texto: "O que você espera dos outros sem nunca comunicar explicitamente?", audioUrl: "/audio/040.mp3", dominio: "Relacionamentos" },
  { texto: "Que tipo de mundo você tenta criar no seu espaço de influência?", audioUrl: "/audio/041.mp3", dominio: "Relacionamentos" },
  { texto: "Qual crença sobre a realidade você sustenta mesmo contra evidências?", audioUrl: "/audio/042.mp3", dominio: "Relacionamentos" },
  { texto: "Em que sentido o mundo é simultaneamente justo e injusto para você?", audioUrl: "/audio/043.mp3", dominio: "Relacionamentos" },
  { texto: "Que verdade sobre a natureza humana você aceita mas deseja que fosse diferente?", audioUrl: "/audio/044.mp3", dominio: "Relacionamentos" },
  { texto: "Que lição o mundo te ensinou da forma mais brusca?", audioUrl: "/audio/045.mp3", dominio: "Relacionamentos" },
  { texto: "O que você oferece ao mundo que inventou dentro de si?", audioUrl: "/audio/046.mp3", dominio: "Relacionamentos" },
  { texto: "Em quem você confia cegamente — e por quê?", audioUrl: "/audio/047.mp3", dominio: "Relacionamentos" },
  { texto: "Qual história coletiva (cultural/familiar) você carrega como verdade não questionada?", audioUrl: "/audio/048.mp3", dominio: "Relacionamentos" },

  // Domínio 5: Trajetória
  { texto: "Qual memória ainda arde quando você a visita?", audioUrl: "/audio/049.mp3", dominio: "Trajetoria" },
  { texto: "Que evento dividiu sua vida em 'antes' e 'depois'?", audioUrl: "/audio/050.mp3", dominio: "Trajetoria" },
  { texto: "Qual foi a decepção que mais moldou quem você é hoje?", audioUrl: "/audio/051.mp3", dominio: "Trajetoria" },
  { texto: "Que dor você normalizou até esquecê-la como dor?", audioUrl: "/audio/052.mp3", dominio: "Trajetoria" },
  { texto: "Qual foi seu maior fracasso que, em retrospecto, foi um redirecionamento necessário?", audioUrl: "/audio/053.mp3", dominio: "Trajetoria" },
  { texto: "Que momento de conexão humana redefiniu sua compreensão de relacionamentos?", audioUrl: "/audio/054.mp3", dominio: "Trajetoria" },
  { texto: "Qual experiência foi simultaneamente a pior e a melhor coisa que te aconteceu?", audioUrl: "/audio/055.mp3", dominio: "Trajetoria" },
  { texto: "Que trauma você transformou em força, mas que ainda carrega vestígios de ferida?", audioUrl: "/audio/056.mp3", dominio: "Trajetoria" },
  { texto: "Que infância você cultiva em você hoje?", audioUrl: "/audio/057.mp3", dominio: "Trajetoria" },
  { texto: "Qual limite que você quebrou ainda reverbera em seus dias?", audioUrl: "/audio/058.mp3", dominio: "Trajetoria" },
  { texto: "Que silêncio na sua história precisa ser contado?", audioUrl: "/audio/059.mp3", dominio: "Trajetoria" },
  { texto: "Qual pessoa que você foi e não reconhece mais?", audioUrl: "/audio/060.mp3", dominio: "Trajetoria" },
  
  // Domínio 6: Emoções
  { texto: "Qual emoção você encontra mais difícil de expressar ou admitir?", audioUrl: "/audio/061.mp3", dominio: "Emocoes" },
  { texto: "O que desencadeia sua resposta emocional mais intensa?", audioUrl: "/audio/062.mp3", dominio: "Emocoes" },
  { texto: "Como você se comporta quando está emocionalmente sobrecarregado?", audioUrl: "/audio/063.mp3", dominio: "Emocoes" },
  { texto: "Que emoção você mascara com outra mais aceitável?", audioUrl: "/audio/064.mp3", dominio: "Emocoes" },
  { texto: "Qual sentimento você associa ao seu 'melhor eu'?", audioUrl: "/audio/065.mp3", dominio: "Emocoes" },
  { texto: "Como você aprendeu a lidar com decepções?", audioUrl: "/audio/066.mp3", dominio: "Emocoes" },
  { texto: "Em que situações sua calma exterior esconde turbulência interior?", audioUrl: "/audio/067.mp3", dominio: "Emocoes" },
  { texto: "Qual emoção você teme que, se plenamente sentida, poderia te consumir?", audioUrl: "/audio/068.mp3", dominio: "Emocoes" },
  { texto: "Em que momentos você chora, mesmo sozinho?", audioUrl: "/audio/069.mp3", dominio: "Emocoes" },
  { texto: "Qual mágoa ainda ativa seu corpo quando lembrada?", audioUrl: "/audio/070.mp3", dominio: "Emocoes" },
  { texto: "Como você celebra suas conquistas internamente?", audioUrl: "/audio/071.mp3", dominio: "Emocoes" },
  { texto: "O que faz seu coração acelerar com alegria genuína?", audioUrl: "/audio/072.mp3", dominio: "Emocoes" },

  // Domínio 7: Conflitos
  { texto: "Cite uma escolha que grita 'isso foi 100% eu'.", audioUrl: "/audio/073.mp3", dominio: "Conflitos" },
  { texto: "Como você toma decisões quando a análise racional e a intuição divergem?", audioUrl: "/audio/074.mp3", dominio: "Conflitos" },
  { texto: "Qual é seu processo para resolver problemas complexos?", audioUrl: "/audio/075.mp3", dominio: "Conflitos" },
  { texto: "Que tipo de decisões você tende a adiar ou evitar?", audioUrl: "/audio/076.mp3", dominio: "Conflitos" },
  { texto: "Como você lida com incertezas quando precisa agir?", audioUrl: "/audio/077.mp3", dominio: "Conflitos" },
  { texto: "Qual é sua relação com arrependimento em decisões passadas?", audioUrl: "/audio/078.mp3", dominio: "Conflitos" },
  { texto: "Quando sua intuição provou estar simultaneamente errada e certa?", audioUrl: "/audio/079.mp3", dominio: "Conflitos" },
  { texto: "Em que tipo de decisão você é excessivamente cuidadoso e impulsivo ao mesmo tempo?", audioUrl: "/audio/080.mp3", dominio: "Conflitos" },
  { texto: "Que decisão mudou o curso da sua vida sem aviso?", audioUrl: "/audio/081.mp3", dominio: "Conflitos" },
  { texto: "Como você decide quando está emocionalmente abalado?", audioUrl: "/audio/082.mp3", dominio: "Conflitos" },
  { texto: "Qual risco você evitou que arrepende hoje?", audioUrl: "/audio/083.mp3", dominio: "Conflitos" },
  { texto: "Que escolha futura você já antevê com ansiedade e esperança ao mesmo tempo?", audioUrl: "/audio/084.mp3", dominio: "Conflitos" },
  
  // Domínio 8: Futuro
  { texto: "Qual incoerência você admite mas ainda não resolve?", audioUrl: "/audio/085.mp3", dominio: "Futuro" },
  { texto: "Que feedback recebido sobre você inicialmente rejeitou, mas depois reconheceu como verdade?", audioUrl: "/audio/086.mp3", dominio: "Futuro" },
  { texto: "Qual aspecto de si mesmo você tem dificuldade em enxergar claramente?", audioUrl: "/audio/087.mp3", dominio: "Futuro" },
  { texto: "Em que área sua autopercepção mais diverge de como os outros te veem?", audioUrl: "/audio/088.mp3", dominio: "Futuro" },
  { texto: "Qual padrão autodestrutivo você só percebe em retrospecto?", audioUrl: "/audio/089.mp3", dominio: "Futuro" },
  { texto: "Que conselho você frequentemente dá aos outros mas raramente segue?", audioUrl: "/audio/090.mp3", dominio: "Futuro" },
  { texto: "Qual qualidade sua é simultaneamente sua maior força e fraqueza?", audioUrl: "/audio/091.mp3", dominio: "Futuro" },
  { texto: "Qual crença você defende logicamente, mas emocionalmente rejeita?", audioUrl: "/audio/092.mp3", dominio: "Futuro" },
  { texto: "Em que momento seu comportamento surpreende quem te conhece?", audioUrl: "/audio/093.mp3", dominio: "Futuro" },
  { texto: "O que você se orgulha de esconder de si mesmo?", audioUrl: "/audio/094.mp3", dominio: "Futuro" },
  { texto: "Como o seu humor muda em silêncio?", audioUrl: "/audio/095.mp3", dominio: "Futuro" },
  { texto: "Que parte de você vive em negação mesmo quando surge clara?", audioUrl: "/audio/096.mp3", dominio: "Futuro" },

  // Domínio 9: Sentido e Propósito
  { texto: "Se o medo tivesse voz, o que ele sussurra no seu ouvido?", audioUrl: "/audio/097.mp3", dominio: "SentidoEProposito" },
  { texto: "Que legado seria inaceitável deixar inacabado?", audioUrl: "/audio/098.mp3", dominio: "SentidoEProposito" },
  { texto: "O que você deseja secretamente, mas hesita em admitir até para si mesmo?", audioUrl: "/audio/099.mp3", dominio: "SentidoEProposito" },
  { texto: "Qual aspiração você abandonou e por quê?", audioUrl: "/audio/100.mp3", dominio: "SentidoEProposito" },
  { texto: "Que tipo de fracasso você teme mais do que admite?", audioUrl: "/audio/101.mp3", dominio: "SentidoEProposito" },
  { texto: "Que sonho você adiou dizendo que 'um dia fará', mas que teme nunca tentar?", audioUrl: "/audio/102.mp3", dominio: "SentidoEProposito" },
  { texto: "O que você mais deseja que também mais teme alcançar?", audioUrl: "/audio/103.mp3", dominio: "SentidoEProposito" },
  { texto: "Que sucesso te assustaria mais do que um fracasso visível?", audioUrl: "/audio/104.mp3", dominio: "SentidoEProposito" },
  { texto: "Em qual momento você se pegou pensando 'isso não era pra mim'?", audioUrl: "/audio/105.mp3", dominio: "SentidoEProposito" },
  { texto: "Quando foi a última vez que se sentiu verdadeiramente orgulhoso de si?", audioUrl: "/audio/106.mp3", dominio: "SentidoEProposito" },
  { texto: "O que você quer muito e ao mesmo tempo teme que aconteça de verdade?", audioUrl: "/audio/107.mp3", dominio: "SentidoEProposito" },
  { texto: "Qual mudança de vida você sabe que precisa fazer, mas ainda não começou?", audioUrl: "/audio/108.mp3", dominio: "SentidoEProposito" },
];


/**
 * Cria e retorna um perfil de especialista inicial, zerado.
 */
export function criarPerfilInicial(): ExpertProfile {
  return {
    bigFive: { Openness: 0, Conscientiousness: 0, Extraversion: 0, Agreeableness: 0, Neuroticism: 0 },
    valoresSchwartz: {
      'Self-Direction': 0, Stimulation: 0, Hedonism: 0, Achievement: 0, Power: 0,
      Security: 0, Conformity: 0, Tradition: 0, Benevolence: 0, Universalism: 0,
    },
    motivadores: { Purpose: 0, Autonomy: 0, Mastery: 0, Connection: 0 },
    coberturaDominios: {
      Identidade: 0, Valores: 0, CrencasSobreSi: 0, Relacionamentos: 0,
      Trajetoria: 0, Emocoes: 0, Conflitos: 0, Futuro: 0, SentidoEProposito: 0
    },
    metricas: { contradicoes: 0, metaforas: 0 },
    metaforasCentrais: [],
    conflitosDeValorDetectados: [],
  };
}
