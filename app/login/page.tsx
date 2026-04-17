'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const USERS = [
  { username: 'admin', password: 'tigo2024', name: 'Administrador' },
  { username: 'agente1', password: 'coltel123', name: 'Agente Soporte' },
  { username: 'supervisor', password: 'super456', name: 'Supervisor N2' },
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate a brief auth check delay
    setTimeout(() => {
      const match = USERS.find(
        (u) => u.username === username.trim() && u.password === password
      )

      if (match) {
        localStorage.setItem(
          'tigo_user',
          JSON.stringify({ username: match.username, name: match.name })
        )
        router.push('/')
      } else {
        setError('Usuario o contraseña incorrectos. Verifica tus credenciales.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Left panel (60%) ── */}
      <div className="relative hidden w-[60%] flex-col lg:flex">
        {/* Background image */}
        <Image
          src="/img-pruebas/millicom/login.png"
          alt="Fondo Tigo Coltel"
          fill
          priority
          className="object-cover"
          sizes="60vw"
        />
        {/* Dark-blue overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0, 10, 60, 0.62)' }}
          aria-hidden="true"
        />
        {/* Centered logo */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
          <Image
            src="/img-pruebas/millicom/logo.png"
            alt="Tigo — Millicom"
            width={200}
            height={80}
            className="object-contain drop-shadow-xl"
            priority
          />
          <p className="mt-6 text-center text-lg font-light text-white/80 max-w-sm leading-relaxed">
            Plataforma de soporte técnico inteligente para Coltel
          </p>
        </div>
      </div>

      {/* ── Right panel (40%) ── */}
      <div
        className="flex w-full flex-col items-center justify-center px-8 lg:w-[40%]"
        style={{ background: '#FFFFFF' }}
      >
        <div className="w-full max-w-sm">
          {/* Logo — shown on mobile and at top of form */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/img-pruebas/millicom/logo.png"
              alt="Tigo"
              width={130}
              height={52}
              className="object-contain"
              priority
            />
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <h1
              className="text-3xl font-bold"
              style={{ color: '#001EB3' }}
            >
              Bienvenido
            </h1>
            <p className="mt-1 text-sm font-medium" style={{ color: '#666666' }}>
              Asistente IA Coltel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium"
                style={{ color: '#444444' }}
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                style={{
                  borderRadius: '25px',
                  border: '1px solid #d1d1d1',
                  padding: '10px 18px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  width: '100%',
                  color: '#333333',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#001EB3' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d1d1' }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: '#444444' }}
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                style={{
                  borderRadius: '25px',
                  border: '1px solid #d1d1d1',
                  padding: '10px 18px',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  width: '100%',
                  color: '#333333',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#001EB3' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d1d1' }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: '#fff0f0',
                  border: '1px solid #ffcccc',
                  color: '#c0392b',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#667ab3' : '#001EB3',
                color: '#ffffff',
                borderRadius: '25px',
                width: '100%',
                padding: '11px 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, opacity 0.15s',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#0D2A8A'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#001EB3'
              }}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: '#aaaaaa' }}>
            &copy; {new Date().getFullYear()} Tigo — Millicom. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
