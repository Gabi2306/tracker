"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  function validate() {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) {
      newErrors.email = "El correo es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo valido"
    }
    if (!password) {
      newErrors.password = "La contrasena es requerida"
    } else if (password.length < 6) {
      newErrors.password = "Minimo 6 caracteres"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setErrors({})
    setIsSubmitting(true)
    try {
      const result = await login(email, password)
      if (!result.success) {
        setErrors({ general: result.error || "Email o contrasena incorrectos" })
        return
      }
      router.push("/dashboard")
    } catch {
      setErrors({ general: "Error de conexion. Verifica tu internet e intenta de nuevo." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-8 pt-16">
      {/* Logo */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16S28.84 4 20 4zm0 28c-6.63 0-12-5.37-12-12S13.37 8 20 8s12 5.37 12 12-5.37 12-12 12z"
            fill="#3B82F6"
          />
          <path d="M20 12l-6 8h4v8l6-8h-4v-8z" fill="#10B981" />
        </svg>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-foreground">Carbon Tracker</h1>
      <p className="mb-10 text-center text-sm text-muted-foreground">
        Reduce tu huella de carbono,{"\n"}preserva nuestro futuro.
      </p>

      <form onSubmit={handleLogin} className="w-full" noValidate>
        {errors.general && (
          <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            {errors.general}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Correo electronico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="mb-2">
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contrasena
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="mb-6 text-right">
          <button type="button" className="px-1 py-1 text-xs font-medium text-primary">
            Olvidaste tu contrasena?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-50"
        >
          {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
        </button>
      </form>

      <div className="my-6 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">O CONTINUAR CON</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex w-full gap-3">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-foreground transition-colors active:bg-border">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Google</span>
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-medium text-foreground transition-colors active:bg-border">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        {"No tienes cuenta? "}
        <button
          onClick={() => router.push("/register")}
          className="px-1 py-1 font-medium text-primary"
        >
          Registrate
        </button>
      </p>
    </div>
  )
}
