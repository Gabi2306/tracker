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
          <button type="button" onClick={() => router.push("/forgot-password")} className="px-1 py-1 text-xs font-medium text-primary">
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
