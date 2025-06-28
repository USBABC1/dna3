import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'

// Configuração do cliente Supabase para o adaptador de autenticação
// Usa a SERVICE_ROLE_KEY para ter privilégios administrativos necessários para gerenciar usuários
// Em desenvolvimento, usa valores placeholder se as variáveis não estiverem configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key'

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    db: {
      schema: 'next_auth',
    },
  }
)

const handler = NextAuth({
  // Configuração dos provedores de autenticação
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_client_secret',
      // Solicita apenas as permissões mínimas necessárias
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],

  // Adaptador para integração com Supabase (apenas se as variáveis estiverem configuradas)
  ...(supabaseUrl !== 'https://placeholder.supabase.co' && supabaseServiceKey !== 'placeholder_service_role_key' ? {
    adapter: SupabaseAdapter({
      url: supabaseUrl,
      secret: supabaseServiceKey,
    }),
  } : {}),

  // Configurações de sessão e segurança
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Configurações de JWT
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Callbacks para personalizar o comportamento da autenticação
  callbacks: {
    async jwt({ token, user, account }) {
      // Inclui o ID do usuário no token JWT para uso posterior
      if (user) {
        token.userId = user.id
      }
      return token
    },

    async session({ session, token }) {
      // Inclui o ID do usuário na sessão para acesso no frontend
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Validações adicionais podem ser implementadas aqui
      // Por exemplo, verificar se o domínio do email é permitido
      return true
    },
  },

  // Páginas customizadas (opcional)
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Configurações de debug (apenas em desenvolvimento)
  debug: process.env.NODE_ENV === 'development',

  // Configurações de cookies para segurança
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
})

export { handler as GET, handler as POST }