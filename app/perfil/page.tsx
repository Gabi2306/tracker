"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { 
  LogOut, Leaf, ChevronRight, 
  Lock, Check, X, Eye, EyeOff, Pencil
} from "lucide-react"

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, activities, updateUserName, updatePassword } = useApp()
  
  // Estados para edicion de nombre
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [nameSuccess, setNameSuccess] = useState(false)

  // Estados para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    if (user) {
      setNewName(user.name)
    }
  }, [user])

  // Handlers de nombre
  const handleSaveName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false)
      return
    }
    
    setNameLoading(true)
    setNameError("")
    
    const result = await updateUserName(newName.trim())
    
    if (result.success) {
      setNameSuccess(true)
      setIsEditingName(false)
      setTimeout(() => setNameSuccess(false), 2000)
    } else {
      setNameError(result.error || "Error al actualizar")
    }
    
    setNameLoading(false)
  }

  const handleCancelName = () => {
    setNewName(user?.name || "")
    setIsEditingName(false)
    setNameError("")
  }

  // Handlers de contraseña
  const handleSavePassword = async () => {
    setPasswordError("")
    
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }
    
    setPasswordLoading(true)
    
    const result = await updatePassword(currentPassword, newPassword)
    
    if (result.success) {
      setPasswordSuccess(true)
      setIsChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 2000)
    } else {
      setPasswordError(result.error || "Error al actualizar")
    }
    
    setPasswordLoading(false)
  }

  const handleCancelPassword = () => {
    setIsChangingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordError("")
  }

  // Estadisticas
  const totalEmissions = activities.reduce((sum, a) => sum + a.emissions, 0)
  const totalActivities = activities.length
  const memberSince = user ? new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" }) : ""

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
          <p className="text-xs text-muted-foreground">Configuracion y estadisticas</p>
        </div>

        {/* Info de usuario con edicion de nombre */}
        <div className="mb-6 rounded-2xl bg-card p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {(user?.name?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tu nombre"
                    autoFocus
                  />
                  {nameError && (
                    <p className="text-xs text-destructive">{nameError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={nameLoading}
                      className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {nameLoading ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelName}
                      className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-foreground">{user?.name}</p>
                      {nameSuccess && (
                        <span className="text-xs text-accent">Actualizado</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Miembro desde {memberSince}</p>
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="ml-auto rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="Editar nombre"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estadisticas rapidas */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Total emisiones</p>
            <p className="text-2xl font-bold text-foreground">{totalEmissions.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO2e</p>
          </div>
          <div className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Actividades</p>
            <p className="text-2xl font-bold text-foreground">{totalActivities}</p>
            <p className="text-xs text-muted-foreground">registradas</p>
          </div>
        </div>

        {/* Seguridad - Cambio de contraseña */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">Seguridad</h2>
          <div className="rounded-2xl bg-card">
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
                    <p className="text-xs text-muted-foreground">Actualiza tu contraseña de acceso</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {passwordSuccess && (
                    <span className="text-xs text-accent">Actualizada</span>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ) : (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
                    <p className="text-xs text-muted-foreground">Ingresa tu contraseña actual y la nueva</p>
                  </div>
                </div>

                {/* Contraseña actual */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Contraseña actual</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg bg-secondary px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Nueva contraseña */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg bg-secondary px-3 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Minimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg bg-secondary px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>

                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSavePassword}
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelPassword}
                    className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Cerrar sesion */}
        <button
          onClick={async () => {
            await logout()
            router.push("/")
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 px-4 py-4 text-destructive transition-colors active:bg-destructive/20"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar sesion</span>
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
