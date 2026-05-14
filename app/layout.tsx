import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asistente IA — Coltel',
  description:
    'Asistente inteligente para resolución de incidentes y procedimientos operativos de Coltel.',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Roboto loaded via globals.css @import — no extra link tag needed */}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
