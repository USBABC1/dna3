import { DeepgramClient, createClient } from '@deepgram/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabase } from '@/lib/supabase'
import { GoogleDriveService } from '@/services/googleDriveService'

/**
 * Rota de API para transcrever áudio e persistir dados
 * Esta é a função central da plataforma que:
 * 1. Valida a autenticação do usuário
 * 2. Processa o áudio com Deepgram (transcrição)
 * 3. Armazena o áudio no Google Drive
 * 4. Salva os dados no Supabase
 */
export async function POST(request: NextRequest) {
  try {
    // === VALIDAÇÃO DE AUTENTICAÇÃO ===
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // === VALIDAÇÃO DE CONFIGURAÇÃO ===
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY
    if (!deepgramApiKey) {
      console.error('Chave da API da Deepgram não configurada')
      return NextResponse.json(
        { error: 'Serviço de transcrição não disponível' },
        { status: 500 }
      )
    }

    // === EXTRAÇÃO DOS DADOS DA REQUISIÇÃO ===
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const sessionId = formData.get('sessionId') as string
    const questionIndex = parseInt(formData.get('questionIndex') as string)
    const questionText = formData.get('questionText') as string

    if (!audioFile || !sessionId || isNaN(questionIndex)) {
      return NextResponse.json(
        { error: 'Dados da requisição incompletos' },
        { status: 400 }
      )
    }

    // === VALIDAÇÃO DE PROPRIEDADE DA SESSÃO ===
    // Verifica se a sessão pertence ao usuário autenticado
    const { data: sessionData, error: sessionError } = await supabase
      .from('analysis_sessions')
      .select('user_id, auth.users!inner(email)')
      .eq('id', sessionId)
      .eq('auth.users.email', session.user.email)
      .single()

    if (sessionError || !sessionData) {
      console.error('Sessão não encontrada ou não autorizada:', sessionError)
      return NextResponse.json(
        { error: 'Sessão não encontrada ou não autorizada' },
        { status: 403 }
      )
    }

    // === PREPARAÇÃO DOS DADOS DE ÁUDIO ===
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // === PROCESSAMENTO PARALELO ===
    // Executa transcrição e upload simultaneamente para máxima eficiência
    const [transcriptionResult, driveUploadResult] = await Promise.allSettled([
      // Operação 1: Transcrição com Deepgram
      (async () => {
        const deepgram: DeepgramClient = createClient(deepgramApiKey)
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
          throw new Error(`Erro na transcrição: ${error.message}`)
        }

        return result?.results?.channels[0]?.alternatives[0]?.transcript || ''
      })(),

      // Operação 2: Upload para Google Drive
      (async () => {
        const driveService = new GoogleDriveService()
        return await driveService.uploadAudio(
          audioBuffer,
          session.user.email!,
          sessionId,
          questionIndex
        )
      })(),
    ])

    // === VERIFICAÇÃO DOS RESULTADOS ===
    if (transcriptionResult.status === 'rejected') {
      console.error('Falha na transcrição:', transcriptionResult.reason)
      throw new Error('Falha no serviço de transcrição')
    }

    if (driveUploadResult.status === 'rejected') {
      console.error('Falha no upload:', driveUploadResult.reason)
      throw new Error('Falha no armazenamento do áudio')
    }

    const transcript = transcriptionResult.value
    const audioFileId = driveUploadResult.value

    // === PERSISTÊNCIA NO BANCO DE DADOS ===
    const { data: responseData, error: insertError } = await supabase
      .from('user_responses')
      .insert({
        session_id: sessionId,
        question_index: questionIndex,
        question_text: questionText,
        transcript_text: transcript,
        audio_file_drive_id: audioFileId,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao salvar resposta no banco:', insertError)
      // Nota: Em um sistema de produção, aqui implementaríamos rollback
      // do upload no Drive em caso de falha no banco de dados
      return NextResponse.json(
        { error: 'Falha ao salvar dados da resposta' },
        { status: 500 }
      )
    }

    // === RESPOSTA DE SUCESSO ===
    return NextResponse.json({
      transcript,
      audioFileId,
      responseId: responseData.id,
      message: 'Resposta processada com sucesso'
    })

  } catch (error) {
    console.error('Erro interno na rota de transcrição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
