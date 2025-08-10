'use client'

import { ThemeProvider } from 'next-themes'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      // This is the key change!
      enableColorScheme={false}
      // You can keep this if you want
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}