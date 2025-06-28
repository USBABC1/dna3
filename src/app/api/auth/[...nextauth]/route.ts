import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Configuração do cliente Supabase para operações manuais
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente Supabase para operações administrativas
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

const handler = NextAuth({
  // Configuração dos provedores de autenticação
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Solicita apenas as permissões mínimas necessárias
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],

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
      // Na primeira vez que o usuário faz login, sincroniza com Supabase
      if (user && account && supabase) {
        try {
          // Cria ou atualiza o usuário no Supabase
          const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: user.email!,
            email_confirm: true,
            user_metadata: {
              name: user.name,
              picture: user.image,
              provider: account.provider,
            },
          })

          if (newUser.user) {
            token.userId = newUser.user.id
          } else if (error && error.message.includes('already registered')) {
            // Usuário já existe, busca o ID
            const { data: existingUser } = await supabase.auth.admin.listUsers()
            const foundUser = existingUser.users.find(u => u.email === user.email)
            if (foundUser) {
              token.userId = foundUser.id
            }
          }
        } catch (error) {
          console.error('Erro ao sincronizar usuário com Supabase:', error)
          // Usa um ID baseado no email como fallback
          token.userId = user.email
        }
      } else {
        // Fallback se não houver Supabase configurado
        token.userId = user?.email || user?.id
      }

      return token
    },

    async session({ session, token }) {
      // Inclui o ID do usuário na sessão para acesso no frontend
      if (token.userId && session.user) {
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

  // Páginas customizadas
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redireciona erros para a página de login
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