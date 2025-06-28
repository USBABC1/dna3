import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase para operações administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente Supabase para operações administrativas
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export const authOptions: NextAuthOptions = {
  // Configuração dos provedores de autenticação
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Configuração da sessão
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Configuração do JWT
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // Callbacks para personalizar o comportamento
  callbacks: {
    async jwt({ token, user, account }) {
      // Quando o usuário faz login pela primeira vez
      if (user && account) {
        console.log('Novo login detectado:', { user: user.email, account: account.provider })
        
        // Sincroniza com Supabase se configurado
        if (supabase && user.email) {
          try {
            // Tenta criar o usuário no Supabase Auth
            const { data: newUser, error } = await supabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                name: user.name,
                picture: user.image,
                provider: account.provider,
              },
            })

            if (newUser.user) {
              token.userId = newUser.user.id
              console.log('Usuário criado/encontrado no Supabase:', newUser.user.id)
            } else if (error && error.message.includes('already registered')) {
              // Usuário já existe, busca o ID
              const { data: existingUsers } = await supabase.auth.admin.listUsers()
              const foundUser = existingUsers.users.find(u => u.email === user.email)
              if (foundUser) {
                token.userId = foundUser.id
                console.log('Usuário existente encontrado:', foundUser.id)
              } else {
                throw new Error('Usuário existe mas não foi encontrado')
              }
            } else {
              throw error
            }
          } catch (error) {
            console.error('Erro ao sincronizar usuário com Supabase:', error)
            // Usa um ID baseado no email como fallback
            token.userId = user.email || user.id || 'unknown'
          }
        } else {
          // Fallback se não houver Supabase configurado
          token.userId = user?.email || user?.id || 'unknown'
        }
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
  },

  // Configurações de debug (apenas em desenvolvimento)
  debug: process.env.NODE_ENV === 'development',

  // Configurações de segurança
  secret: process.env.NEXTAUTH_SECRET,
  
  // Configurações adicionais
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('Evento de login:', {
        user: user.email,
        provider: account?.provider,
        isNewUser,
      })
    },
    async signOut({ session, token }) {
      console.log('Evento de logout:', { user: session?.user?.email })
    },
  },
}