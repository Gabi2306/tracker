"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useApp()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = "El nombre es requerido"
    if (!form.email) {
      newErrors.email = "El correo es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Ingresa un correo valido"
    }
    if (!form.password) {
      newErrors.password = "La contrasena es requerida"
    } else if (form.password.length < 6) {
      newErrors.password = "Minimo 6 caracteres"
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contrasena"
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contrasenas no coinciden"
    }
    if (!agreed) {
      newErrors.agreed = "Debes aceptar los terminos y condiciones"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setErrors({})
    setIsSubmitting(true)
    try {
      const result = await register(form.name, form.email, form.password)
      if (!result.success) {
        setErrors({ general: result.error || "No se pudo crear la cuenta. Intenta de nuevo." })
        return
      }
      if (result.error === "confirm_email") {
        setErrors({ general: "Te enviamos un correo de confirmacion. Revisa tu bandeja de entrada para verificar tu cuenta." })
        return
      }
      router.push("/dashboard")
    } catch {
      setErrors({ general: "Error de conexion. Verifica tu internet e intenta de nuevo." })
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-4">
      {/* Boton volver */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
        aria-label="Volver"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground">Crear cuenta</h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
        Comienza tu camino hacia una menor huella de carbono.
      </p>

      <form onSubmit={handleRegister} className="flex flex-1 flex-col" noValidate>
        {errors.general && (
          <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            {errors.general}
          </div>
        )}

        {/* Nombre completo */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nombre completo
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Juan Perez"
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoComplete="name"
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Correo */}
        <div className="mb-4">
          <label htmlFor="reg-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Correo electronico
          </label>
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="juan@ejemplo.com"
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>

        {/* Contrasena */}
        <div className="mb-4">
          <label htmlFor="reg-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contrasena
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              autoComplete="new-password"
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

        {/* Confirmar contrasena */}
        <div className="mb-6">
          <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Confirmar contrasena
          </label>
          <input
            id="confirm-password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            placeholder="********"
            className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoComplete="new-password"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>

        {/* Terminos */}
        <div className="mb-6 flex items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreed}
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              agreed ? "border-primary bg-primary" : "border-border bg-secondary"
            }`}
          >
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className="text-sm text-muted-foreground">
            Acepto los{" "}
            <button type="button" className="px-0.5 text-primary underline">
              Terminos y Condiciones
            </button>
          </span>
        </div>
        {errors.agreed && <p className="-mt-4 mb-4 text-xs text-destructive">{errors.agreed}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-50"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ya tienes una cuenta?{" "}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-1 py-1 font-medium text-primary"
          >
            Inicia sesion
          </button>
        </p>
      </form>
    </div>
  )
}
