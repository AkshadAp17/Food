import React from 'react'
import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './components/providers'
import { AppRouter } from './components/AppRouter'

export const metadata: Metadata = {
  title: 'FoodieExpress - Food Delivery',
  description: 'Order delicious food from your favorite restaurants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppRouter>
            {children}
          </AppRouter>
        </Providers>
      </body>
    </html>
  )
}