"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, Mail, CheckCircle } from "lucide-react"

const supabase = createClient()

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({})

  function validate() {
    const newErrors: { email?: string } = {}
    if (!email) {
      newErrors.email = "El correo es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo valido"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setErrors({})
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard`,
      })
      if (error) {
        setErrors({ general: "No se pudo enviar el correo. Intenta de nuevo." })
        return
      }
      setSent(true)
    } catch {
      setErrors({ general: "Error de conexion. Verifica tu internet e intenta de nuevo." })
    } finally {
      setIsSubmitting(false)
    }
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

      {sent ? (
        /* Pantalla de confirmacion */
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Correo enviado</h1>
          <p className="mb-8 text-center text-sm leading-relaxed text-muted-foreground">
            Hemos enviado un enlace de recuperacion a <strong className="text-foreground">{email}</strong>.
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80"
          >
            Volver al inicio de sesion
          </button>
          <button
            onClick={() => { setSent(false); setIsSubmitting(false) }}
            className="mt-4 text-sm font-medium text-primary"
          >
            Reenviar correo
          </button>
        </div>
      ) : (
        /* Formulario */
        <>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Recuperar contraseña</h1>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            Ingresa tu correo electronico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-1 flex-col" noValidate>
            {errors.general && (
              <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
                {errors.general}
              </div>
            )}

            <div className="mb-6">
              <label
                htmlFor="reset-email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Correo electronico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="reset-email"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace de recuperacion"}
            </button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-1 py-1 font-medium text-primary"
              >
                Inicia sesion
              </button>
            </p>
          </form>
        </>
      )}
    </div>
  )
}
