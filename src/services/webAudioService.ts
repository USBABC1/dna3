// src/services/webAudioService.ts

let audioContext: AudioContext | null = null;
let source: AudioBufferSourceNode | null = null;

export const initAudio = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const stopAudio = () => {
  if (source) {
    source.onended = null; // Remove o callback para não acionar a lógica de fim de áudio
    source.stop();
    source = null;
  }
};

export const playAudioFromUrl = (url: string, onEnded: () => void): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!audioContext) {
      // Embora a inicialização seja feita na ação do usuário, isso serve como uma garantia.
      try {
        await initAudio();
      } catch (error) {
        return reject(new Error('AudioContext não pôde ser inicializado.'));
      }
      
      if (!audioContext) {
        return reject(new Error('AudioContext não pôde ser inicializado.'));
      }
    }

    // Garante que o contexto de áudio seja retomado se estiver suspenso (necessário para autoplay)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ao buscar áudio: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      if (source) {
        source.stop();
      }

      source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      // --- CORREÇÃO APLICADA AQUI ---
      // Agendamos o início para 0.1 segundo no futuro no relógio do AudioContext.
      // Isso dá ao pipeline de áudio tempo para se preparar e evita o corte no início.
      const startTime = audioContext.currentTime + 0.9;
      source.start(startTime);
      // --- FIM DA CORREÇÃO ---

      source.onended = () => {
        onEnded();
        resolve();
      };
    } catch (error) {
      console.error('Falha ao tocar áudio:', error);
      reject(error);
    }
  });
};


// Funções de gravação permanecem as mesmas
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startRecording = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return reject(new Error('API de gravação não é suportada neste navegador.'));
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.start();
      resolve();
    } catch (err) {
      console.error('Erro ao acessar o microfone:', err);
      reject(err);
    }
  });
};

export const stopRecording = (): Promise<Blob> => {
  return new Promise((resolve) => {
    if (!mediaRecorder) {
      throw new Error('O MediaRecorder não foi iniciado.');
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      // Para o stream do microfone para que o ícone de gravação suma
      mediaRecorder?.stream.getTracks().forEach(track => track.stop());
      resolve(audioBlob);
    };

    mediaRecorder.stop();
  });
};