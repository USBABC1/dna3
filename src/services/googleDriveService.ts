import { google } from 'googleapis'

/**
 * Serviço para gerenciar uploads de arquivos de áudio no Google Drive
 * Utiliza a conta de administrador para armazenar os arquivos de forma organizada
 */
export class GoogleDriveService {
  private drive: any
  private auth: any

  constructor() {
    // Configuração da autenticação OAuth2 usando as credenciais do administrador
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob' // Redirect URI para aplicações instaladas
    )

    // Define o refresh token para obter access tokens automaticamente
    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN,
    })

    // Inicializa o cliente da Google Drive API
    this.drive = google.drive({ version: 'v3', auth: this.auth })
  }

  /**
   * Cria uma pasta para o usuário se ela não existir
   * @param userEmail Email do usuário para nomear a pasta
   * @returns ID da pasta criada ou encontrada
   */
  private async ensureUserFolder(userEmail: string): Promise<string> {
    try {
      // Sanitiza o email para usar como nome de pasta
      const folderName = `DNA_${userEmail.replace(/[^a-zA-Z0-9@.-]/g, '_')}`
      
      // Procura por uma pasta existente com este nome
      const existingFolders = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      })

      if (existingFolders.data.files && existingFolders.data.files.length > 0) {
        // Pasta já existe, retorna o ID
        return existingFolders.data.files[0].id
      }

      // Cria uma nova pasta
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID 
          ? [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID] 
          : undefined,
      }

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      })

      return folder.data.id
    } catch (error) {
      console.error('Erro ao criar/encontrar pasta do usuário:', error)
      throw new Error('Falha ao preparar pasta de armazenamento')
    }
  }

  /**
   * Faz upload de um arquivo de áudio para o Google Drive
   * @param audioBuffer Buffer contendo os dados do áudio
   * @param userEmail Email do usuário (para organização)
   * @param sessionId ID da sessão de análise
   * @param questionIndex Índice da pergunta
   * @returns ID do arquivo no Google Drive
   */
  async uploadAudio(
    audioBuffer: Buffer,
    userEmail: string,
    sessionId: string,
    questionIndex: number
  ): Promise<string> {
    try {
      // Garante que a pasta do usuário existe
      const userFolderId = await this.ensureUserFolder(userEmail)

      // Gera um nome único para o arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `DNA_${sessionId}_Q${questionIndex}_${timestamp}.mp3`

      // Metadados do arquivo
      const fileMetadata = {
        name: fileName,
        parents: [userFolderId],
        description: `Resposta de áudio - Sessão: ${sessionId}, Pergunta: ${questionIndex}`,
      }

      // Configuração da mídia
      const media = {
        mimeType: 'audio/mpeg',
        body: audioBuffer,
      }

      // Faz o upload do arquivo
      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, size, createdTime',
      })

      console.log(`Arquivo de áudio enviado com sucesso: ${file.data.name} (ID: ${file.data.id})`)
      return file.data.id

    } catch (error) {
      console.error('Erro no upload do áudio para Google Drive:', error)
      throw new Error('Falha no upload do arquivo de áudio')
    }
  }

  /**
   * Obtém informações de um arquivo no Google Drive
   * @param fileId ID do arquivo
   * @returns Informações do arquivo
   */
  async getFileInfo(fileId: string) {
    try {
      const file = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, createdTime, mimeType, parents',
      })

      return file.data
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error)
      throw new Error('Falha ao acessar arquivo')
    }
  }

  /**
   * Gera uma URL de download temporária para um arquivo
   * @param fileId ID do arquivo
   * @returns URL de download
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      // Para arquivos de áudio, usamos a URL de download direto
      return `https://drive.google.com/uc?id=${fileId}&export=download`
    } catch (error) {
      console.error('Erro ao gerar URL de download:', error)
      throw new Error('Falha ao gerar link de download')
    }
  }

  /**
   * Lista todos os arquivos de um usuário
   * @param userEmail Email do usuário
   * @returns Lista de arquivos
   */
  async listUserFiles(userEmail: string) {
    try {
      const userFolderId = await this.ensureUserFolder(userEmail)

      const files = await this.drive.files.list({
        q: `'${userFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, size, createdTime, mimeType)',
        orderBy: 'createdTime desc',
      })

      return files.data.files || []
    } catch (error) {
      console.error('Erro ao listar arquivos do usuário:', error)
      throw new Error('Falha ao listar arquivos')
    }
  }
}