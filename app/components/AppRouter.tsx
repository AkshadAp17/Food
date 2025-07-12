'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from '../hooks/useAuth'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { AuthPage } from '../pages/AuthPage'
import { Toaster } from '../components/ui/toaster'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user || !user.isVerified) {
    return <AuthPage />
  }

  return <>{children}</>
}

export function AppRouter({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
      <Toaster />
    </AuthProvider>
  )
}