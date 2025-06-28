'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Componente que fornece os provedores de contexto para toda a aplicação
 * Inclui o SessionProvider do NextAuth para gerenciamento de autenticação
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}