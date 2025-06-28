# 🚀 Guia de Deploy da Plataforma DNA

Este documento fornece instruções passo a passo para fazer o deploy da plataforma DNA em produção.

## 📋 Pré-requisitos

Antes de começar, você precisará de contas nos seguintes serviços:

- ✅ **Netlify** (para hospedagem)
- ✅ **Supabase** (banco de dados)
- ✅ **Google Cloud Platform** (autenticação e Drive)
- ✅ **Deepgram** (transcrição de áudio)
- ✅ **GitHub** (controle de versão)

## 🔧 Configuração dos Serviços

### 1. Supabase (Banco de Dados)

1. **Criar Projeto**:
   - Acesse [supabase.com](https://supabase.com)
   - Clique em "New Project"
   - Escolha um nome e senha para o banco

2. **Configurar Schema**:
   - Vá para SQL Editor
   - Execute o script `database-schema.sql`
   - Verifique se as tabelas foram criadas

3. **Obter Credenciais**:
   - Vá para Settings > API
   - Copie:
     - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Google Cloud Platform (OAuth + Drive)

1. **Criar/Configurar Projeto**:
   - Acesse [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um novo projeto ou use existente

2. **Ativar APIs**:
   - Google+ API (para OAuth)
   - Google Drive API (para armazenamento)

3. **Configurar OAuth**:
   - Vá para APIs & Services > Credentials
   - Crie credenciais OAuth 2.0
   - Configure tela de consentimento
   - Adicione domínios autorizados:
     - JavaScript origins: `https://seu-app.netlify.app`
     - Redirect URIs: `https://seu-app.netlify.app/api/auth/callback/google`

4. **Obter Credenciais OAuth**:
   - Copie Client ID → `GOOGLE_CLIENT_ID`
   - Copie Client Secret → `GOOGLE_CLIENT_SECRET`

5. **Configurar Google Drive**:
   - Acesse [OAuth Playground](https://developers.google.com/oauthplayground)
   - Configure com suas credenciais OAuth
   - Autorize escopo: `https://www.googleapis.com/auth/drive.file`
   - Obtenha refresh token → `GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN`

### 3. Deepgram (Transcrição)

1. **Criar Conta**:
   - Acesse [deepgram.com](https://deepgram.com)
   - Crie uma conta gratuita

2. **Obter API Key**:
   - Vá para Dashboard > API Keys
   - Crie uma nova chave
   - Copie → `DEEPGRAM_API_KEY`

### 4. NextAuth (Segurança)

1. **Gerar Secret**:
   ```bash
   openssl rand -base64 32
   ```
   - Copie o resultado → `NEXTAUTH_SECRET`

## 🌐 Deploy no Netlify

### 1. Preparar Repositório

1. **Push para GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete DNA platform implementation"
   git push origin main
   ```

### 2. Conectar ao Netlify

1. **Criar Site**:
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub

2. **Configurar Build**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18`

### 3. Configurar Variáveis de Ambiente

No painel do Netlify, vá para Site configuration > Environment variables e adicione:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret

# NextAuth
NEXTAUTH_SECRET=sua_chave_secreta_gerada
NEXTAUTH_URL=https://seu-app.netlify.app

# Deepgram
DEEPGRAM_API_KEY=sua_chave_deepgram

# Google Drive
GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN=seu_refresh_token
GOOGLE_DRIVE_PARENT_FOLDER_ID=id_pasta_opcional
```

### 4. Deploy

1. **Primeiro Deploy**:
   - O Netlify fará o deploy automaticamente
   - Aguarde a conclusão (5-10 minutos)

2. **Atualizar URLs no Google Cloud**:
   - Após o deploy, você terá a URL final
   - Volte ao Google Cloud Console
   - Atualize as URLs autorizadas com a URL real do Netlify

## ✅ Validação Pós-Deploy

### 1. Teste de Funcionalidade Básica

1. **Acesse a URL do site**
2. **Teste o modo convidado**:
   - Clique em "Experimentar sem Login"
   - Verifique se a interface carrega
   - Teste a gravação (se Deepgram estiver configurado)

3. **Teste o login**:
   - Clique em "Login com Google"
   - Verifique se redireciona corretamente
   - Teste o dashboard (se Supabase estiver configurado)

### 2. Verificação de Logs

1. **Netlify Functions**:
   - Vá para Functions no painel do Netlify
   - Verifique logs de erros

2. **Supabase**:
   - Vá para Logs no painel do Supabase
   - Verifique conexões e queries

### 3. Teste de Integração Completa

1. **Fluxo Completo Autenticado**:
   - Login → Dashboard → Nova Sessão → Gravação → Transcrição
   - Verifique se dados são salvos no Supabase
   - Verifique se áudios são salvos no Google Drive

## 🔒 Segurança em Produção

### 1. Configurações Recomendadas

- ✅ HTTPS obrigatório (Netlify fornece automaticamente)
- ✅ Cookies seguros (configurado no NextAuth)
- ✅ Row Level Security ativo no Supabase
- ✅ Variáveis de ambiente protegidas

### 2. Monitoramento

- **Netlify**: Analytics e logs de função
- **Supabase**: Métricas de uso e performance
- **Google Cloud**: Quotas e billing alerts

## 🔄 Manutenção

### 1. Atualizações

```bash
# Atualizar dependências
npm update

# Deploy de nova versão
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### 2. Backup

- **Supabase**: Backups automáticos diários
- **Google Drive**: Redundância nativa
- **Código**: Versionamento no Git

### 3. Rotação de Segredos

A cada 6 meses, rotacione:
- `NEXTAUTH_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_DRIVE_ADMIN_REFRESH_TOKEN`

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de autenticação**:
   - Verifique URLs no Google Cloud
   - Confirme variáveis de ambiente

2. **Erro de banco de dados**:
   - Verifique conexão com Supabase
   - Confirme se RLS está ativo

3. **Erro de transcrição**:
   - Verifique quota do Deepgram
   - Confirme API key válida

### Logs Úteis

```bash
# Netlify Functions
netlify dev

# Supabase local
supabase start

# Next.js local
npm run dev
```

## 📞 Suporte

Para problemas técnicos:
- 📧 Email: suporte@dna-analysis.com
- 📚 Documentação: Este README
- 🐛 Issues: GitHub Issues

---

**Sucesso no seu deploy! 🎉**