import { DeepgramClient, createClient } from '@deepgram/sdk'
import { NextResponse } from 'next/server'

/**
 * Rota de API para transcrever áudio para usuários não autenticados
 * Versão simplificada que apenas retorna a transcrição sem persistir dados
 */
export async function POST(request: Request) {
  try {
    // === VALIDAÇÃO DE CONFIGURAÇÃO ===
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY
    if (!deepgramApiKey) {
      console.error('Chave da API da Deepgram não configurada')
      return NextResponse.json(
        { error: 'Serviço de transcrição não disponível' },
        { status: 500 }
      )
    }

    // === PROCESSAMENTO DO ÁUDIO ===
    const audioBlob = await request.blob()
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer())

    // Inicializa o cliente da Deepgram
    const deepgram: DeepgramClient = createClient(deepgramApiKey)
    
    // Envia o áudio para transcrição
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        model: 'nova-2',
        language: 'pt-BR',
        smart_format: true,
        punctuate: true,
        paragraphs: true,
      }
    )

    if (error) {
      console.error('Erro na transcrição:', error)
      throw new Error(`Erro na transcrição: ${error.message}`)
    }

    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript || ''

    // === RESPOSTA DE SUCESSO ===
    return NextResponse.json({
      transcript,
      message: 'Transcrição realizada com sucesso'
    })

  } catch (error) {
    console.error('Erro interno na rota de transcrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}