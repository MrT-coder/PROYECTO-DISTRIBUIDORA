import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Sistema de Microservicios",
  description: "Panel de administración para microservicios",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
