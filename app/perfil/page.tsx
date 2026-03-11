"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { Bell, BellOff, Clock, LogOut, User, Leaf, ChevronRight } from "lucide-react"
import { getRandomTip, ENVIRONMENTAL_TIPS } from "@/lib/environmental-tips"

interface NotificationSettings {
  enabled: boolean
  hour: number
  minute: number
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, activities } = useApp()
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 9,
    minute: 0,
  })
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [currentTip, setCurrentTip] = useState(getRandomTip())

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  // Cargar configuracion guardada y registrar service worker
  useEffect(() => {
    const saved = localStorage.getItem("notification-settings")
    if (saved) {
      try {
        setNotificationSettings(JSON.parse(saved))
      } catch {
        // Ignorar errores de parsing
      }
    }

    // Verificar permiso de notificaciones
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    // Registrar service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Error registering service worker:", err)
      })
    }
  }, [])

  // Guardar configuracion
  useEffect(() => {
    localStorage.setItem("notification-settings", JSON.stringify(notificationSettings))
  }, [notificationSettings])

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Tu navegador no soporta notificaciones")
      return false
    }

    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    return permission === "granted"
  }

  const toggleNotifications = async () => {
    if (!notificationSettings.enabled) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setNotificationSettings((prev) => ({ ...prev, enabled: true }))
        scheduleNotification()
      }
    } else {
      setNotificationSettings((prev) => ({ ...prev, enabled: false }))
      cancelScheduledNotification()
    }
  }

  const scheduleNotification = () => {
    // Registrar el service worker para notificaciones programadas
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Guardar la configuracion para que el service worker la use
        localStorage.setItem("notification-settings", JSON.stringify(notificationSettings))
        // Enviar mensaje al service worker para programar la notificacion
        if (registration.active) {
          registration.active.postMessage({
            type: "SCHEDULE_NOTIFICATION",
            hour: notificationSettings.hour,
            minute: notificationSettings.minute,
          })
        }
      })
    }
  }

  const cancelScheduledNotification = () => {
    // Cancelar notificaciones programadas
    localStorage.removeItem("notification-settings")
  }

  const updateTime = (hour: number, minute: number) => {
    setNotificationSettings((prev) => ({ ...prev, hour, minute }))
    setShowTimePicker(false)
    if (notificationSettings.enabled) {
      scheduleNotification()
    }
  }

  const sendTestNotification = () => {
    if (notificationPermission === "granted") {
      const tip = getRandomTip()
      new Notification("Tip Ambiental del Dia", {
        body: `${tip.title}: ${tip.description}`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "eco-tip",
      })
    }
  }

  const formatTime = (hour: number, minute: number) => {
    const h = hour % 12 || 12
    const m = minute.toString().padStart(2, "0")
    const period = hour < 12 ? "AM" : "PM"
    return `${h}:${m} ${period}`
  }

  // Estadisticas del usuario
  const totalEmissions = activities.reduce((sum, a) => sum + a.emissions, 0)
  const totalActivities = activities.length
  const memberSince = user ? new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" }) : ""

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
          <p className="text-xs text-muted-foreground">Configuracion y estadisticas</p>
        </div>

        {/* Info de usuario */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl bg-card p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(user?.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Miembro desde {memberSince}</p>
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

        {/* Configuracion de notificaciones */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">Notificaciones</h2>
          
          <div className="rounded-2xl bg-card">
            {/* Toggle de notificaciones */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  notificationSettings.enabled ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                }`}>
                  {notificationSettings.enabled ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <BellOff className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Tips diarios</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationSettings.enabled ? "Activas" : "Desactivadas"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  notificationSettings.enabled ? "bg-accent" : "bg-secondary"
                }`}
                role="switch"
                aria-checked={notificationSettings.enabled}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    notificationSettings.enabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Selector de hora */}
            {notificationSettings.enabled && (
              <>
                <div className="border-t border-border" />
                <button
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Hora de notificacion</p>
                      <p className="text-xs text-muted-foreground">Recibiras un tip cada dia</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      {formatTime(notificationSettings.hour, notificationSettings.minute)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>

                {showTimePicker && (
                  <>
                    <div className="border-t border-border" />
                    <div className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={notificationSettings.hour}
                          onChange={(e) => updateTime(parseInt(e.target.value), notificationSettings.minute)}
                          className="rounded-lg bg-secondary px-4 py-2 text-lg font-medium text-foreground"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <span className="text-2xl font-bold text-foreground">:</span>
                        <select
                          value={notificationSettings.minute}
                          onChange={(e) => updateTime(notificationSettings.hour, parseInt(e.target.value))}
                          className="rounded-lg bg-secondary px-4 py-2 text-lg font-medium text-foreground"
                        >
                          {[0, 15, 30, 45].map((m) => (
                            <option key={m} value={m}>
                              {m.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        Recibiras un tip ambiental a las {formatTime(notificationSettings.hour, notificationSettings.minute)}
                      </p>
                    </div>
                  </>
                )}

                {/* Boton de prueba */}
                <div className="border-t border-border" />
                <button
                  onClick={sendTestNotification}
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Enviar notificacion de prueba</p>
                      <p className="text-xs text-muted-foreground">Verifica que funcione correctamente</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tip del dia preview */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">Tip del momento</h2>
          <div className="rounded-2xl bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium uppercase text-accent">{currentTip.category}</span>
            </div>
            <p className="mb-1 text-sm font-semibold text-foreground">{currentTip.title}</p>
            <p className="text-xs text-muted-foreground">{currentTip.description}</p>
            <button
              onClick={() => setCurrentTip(getRandomTip())}
              className="mt-3 text-xs font-medium text-primary"
            >
              Ver otro tip
            </button>
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
