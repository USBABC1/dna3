import { DeepgramClient, createClient } from '@deepgram/sdk';
import { NextResponse } from 'next/server';

/**
 * Rota de API para transcrever áudio usando a Deepgram.
 */
export async function POST(request: Request) {
  // Pega a chave da API das variáveis de ambiente.
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    console.error("A chave da API da Deepgram não está configurada.");
    return NextResponse.json(
      { error: 'A chave da API da Deepgram não está configurada no servidor.' },
      { status: 500 }
    );
  }

  // Inicializa o cliente da Deepgram com a chave.
  const deepgram: DeepgramClient = createClient(deepgramApiKey);

  try {
    // Pega o blob de áudio da requisição.
    const audioBlob = await request.blob();
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());

    // Envia o áudio para a Deepgram para transcrição.
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',    // Modelo de transcrição avançado.
        language: 'pt-BR',  // Define o idioma para Português do Brasil.
        smart_format: true, // Formatação inteligente (pontuação, parágrafos).
      }
    );

    if (error) {
      console.error('Erro retornado pela API da Deepgram:', error);
      throw error;
    }

    // Extrai a transcrição do resultado de forma segura.
    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript || '';
    
    // Retorna a transcrição em uma resposta JSON.
    return NextResponse.json({ transcript });

  } catch (error) {
    console.error('Erro interno na rota de transcrição:', error);
    // Retorna uma mensagem de erro genérica.
    return NextResponse.json(
      { error: 'Falha ao transcrever o áudio.' },
      { status: 500 }
    );
  }
}
